import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user } from '@/database/schema'

/**
 * For use in server components / layouts.
 * Returns admin session or redirects to /dashboard.
 */
export const getAdminSession = async () => {
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

  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/dashboard')
  }

  return session
}

/**
 * For use in API routes.
 * Returns user session or error Response.
 */
export const requireAdminApi = async (): Promise<
  | { session: Awaited<ReturnType<typeof auth.api.getSession>> & { user: { id: string; name: string; email: string } }; error?: never }
  | { session?: never; error: NextResponse }
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

  if (!dbUser || dbUser.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Accès interdit' }, { status: 403 }) }
  }

  return { session: session as typeof session & { user: { id: string; name: string; email: string } } }
}
