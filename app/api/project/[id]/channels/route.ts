import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { messageChannel, projectContractor, contractor } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const access = await getProjectAccess(id, session.user.id)
  if (!access) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  // Fetch all channels for the project
  const allChannels = await db
    .select()
    .from(messageChannel)
    .where(eq(messageChannel.projectId, id))
    .orderBy(asc(messageChannel.order))

  // Ensure private contractor channels exist for assigned contractors
  const existingPrivateContractorIds = allChannels
    .filter((ch) => ch.type === 'private_contractor' && ch.contractorId)
    .map((ch) => ch.contractorId)

  // Fetch assigned contractors
  const assignedContractors = await db
    .select({
      contractorId: projectContractor.contractorId,
      companyName: contractor.companyName,
      specialty: projectContractor.specialty,
      userId: contractor.userId,
    })
    .from(projectContractor)
    .innerJoin(contractor, eq(contractor.id, projectContractor.contractorId))
    .where(eq(projectContractor.projectId, id))

  // Create missing private channels
  const newChannels = []
  for (const ac of assignedContractors) {
    if (!existingPrivateContractorIds.includes(ac.contractorId)) {
      const channelId = crypto.randomUUID()
      const newChannel = {
        id: channelId,
        projectId: id,
        name: `private_contractor_${ac.contractorId}`,
        label: ac.companyName,
        type: 'private_contractor' as const,
        contractorId: ac.contractorId,
        order: 100, // after public channels
      }
      newChannels.push(newChannel)
    }
  }

  if (newChannels.length > 0) {
    await db.insert(messageChannel).values(newChannels)
  }

  // Re-fetch all channels after potential inserts
  const channels = newChannels.length > 0
    ? await db
        .select()
        .from(messageChannel)
        .where(eq(messageChannel.projectId, id))
        .orderBy(asc(messageChannel.order))
    : allChannels

  // Filter channels based on user access
  const filteredChannels = channels.filter((ch) => {
    if (ch.type === 'public') return true

    // Private contractor channels: visible to owner, manager, admin
    if (access.role === 'owner' || access.role === 'manager' || access.role === 'admin') return true

    // Contractor can only see their own private channel
    if (access.role === 'contractor' && ch.type === 'private_contractor') {
      const contractorMatch = assignedContractors.find(
        (ac) => ac.userId === session.user.id && ac.contractorId === ch.contractorId
      )
      return !!contractorMatch
    }

    return false
  })

  return NextResponse.json({
    channels: filteredChannels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      label: ch.label,
      type: ch.type,
      contractorId: ch.contractorId,
      order: ch.order,
    })),
  })
}
