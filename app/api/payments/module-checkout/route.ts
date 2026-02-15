import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { PolarAdapter } from '@/lib/payments/providers/polar'
import { GRADIA_MODULES, type GradiaModuleName } from '@/config/payments'
import { env } from '@/config/env'

const moduleCheckoutSchema = z.object({
  module: z.enum(['base', 'design', 'works', 'wallet']),
  projectId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = moduleCheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const { module, projectId } = parsed.data

    // Verify ownership
    const access = await getProjectAccess(projectId, session.user.id)
    if (!access) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Only the project owner can purchase modules
    if (access.role !== 'owner') {
      return NextResponse.json({ error: 'Seul le propriétaire peut acheter des modules' }, { status: 403 })
    }

    // Check module not already active
    const modules = access.project.modules as { design: boolean; works: boolean; wallet: boolean }
    if (module !== 'base' && modules[module as keyof typeof modules]) {
      return NextResponse.json({ error: 'Ce module est déjà actif' }, { status: 400 })
    }
    if (module === 'base' && access.project.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Le module Base est déjà payé' }, { status: 400 })
    }

    const moduleConfig = GRADIA_MODULES[module as GradiaModuleName]
    if (!moduleConfig.productId) {
      return NextResponse.json({ error: 'Module non configuré' }, { status: 500 })
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${appUrl}/fr/dashboard/projects/${projectId}/overview?checkout=success`
    const cancelUrl = `${appUrl}/fr/dashboard/projects/${projectId}/overview?checkout=canceled`

    const adapter = new PolarAdapter()
    const result = await adapter.createModuleCheckout({
      module,
      projectId,
      userId: session.user.id,
      email: session.user.email,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({ url: result.url, sessionId: result.sessionId })
  } catch (error) {
    console.error('Module checkout error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du checkout' }, { status: 500 })
  }
}
