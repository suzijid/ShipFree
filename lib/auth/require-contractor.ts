import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user, contractor } from '@/database/schema'

/**
 * For use in server components / layouts.
 * Returns contractor session + contractor profile, or redirects to /dashboard.
 */
export const getContractorSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!dbUser || dbUser.role !== 'contractor') {
    redirect('/dashboard')
  }

  const [contractorProfile] = await db
    .select()
    .from(contractor)
    .where(eq(contractor.userId, session.user.id))
    .limit(1)

  if (!contractorProfile) {
    redirect('/dashboard')
  }

  return { session, contractor: contractorProfile }
}

/**
 * For use in API routes.
 * Returns user session + contractor profile, or error Response.
 */
export const requireContractorApi = async (): Promise<
  | { session: Awaited<ReturnType<typeof auth.api.getSession>> & { user: { id: string; name: string; email: string } }; contractor: typeof contractor.$inferSelect; error?: never }
  | { session?: never; contractor?: never; error: NextResponse }
> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!dbUser || dbUser.role !== 'contractor') {
    return { error: NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 }) }
  }

  const [contractorProfile] = await db
    .select()
    .from(contractor)
    .where(eq(contractor.userId, session.user.id))
    .limit(1)

  if (!contractorProfile) {
    return { error: NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 }) }
  }

  return {
    session: session as typeof session & { user: { id: string; name: string; email: string } },
    contractor: contractorProfile,
  }
}
