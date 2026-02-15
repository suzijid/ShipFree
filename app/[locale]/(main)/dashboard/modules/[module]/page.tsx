import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import {
  Compass,
  Palette,
  HardHat,
  Wallet,
  Check,
  Lock,
  ArrowRight,
  FolderKanban,
  Plus,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { project } from '@/database/schema'
import { GRADIA_MODULES, type GradiaModuleName } from '@/config/payments'

const SLUG_TO_MODULE: Record<string, GradiaModuleName> = {
  base: 'base',
  conception: 'design',
  travaux: 'works',
  finances: 'wallet',
}

const MODULE_ICON: Record<GradiaModuleName, typeof Compass> = {
  base: Compass,
  design: Palette,
  works: HardHat,
  wallet: Wallet,
}

const MODULE_FEATURES: Record<GradiaModuleName, string[]> = {
  base: [
    'Rendez-vous de cadrage personnalisé',
    'Fiche projet structurée par l\'IA',
    'Suivi global de l\'avancement',
    'Tableau de bord dédié',
    'Messagerie avec le MOE',
  ],
  design: [
    'Esquisse et plans préliminaires',
    'Avant-projet sommaire (APS)',
    'Avant-projet définitif (APD)',
    'Choix matériaux et finitions',
    'Plans d\'exécution',
  ],
  works: [
    'Planning de chantier détaillé',
    'Coordination des artisans',
    'Suivi de chantier hebdomadaire',
    'Comptes-rendus de visite',
    'Réception des travaux',
  ],
  wallet: [
    'Échéancier de paiement structuré',
    'Appels de fonds automatisés',
    'Suivi des règlements',
    'Alertes échéances',
    'Historique complet',
  ],
}

const MODULE_DB_FIELD: Record<GradiaModuleName, string> = {
  base: 'base',
  design: 'design',
  works: 'works',
  wallet: 'wallet',
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params
  const moduleKey = SLUG_TO_MODULE[slug]
  if (!moduleKey) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const config = GRADIA_MODULES[moduleKey]
  const Icon = MODULE_ICON[moduleKey]
  const features = MODULE_FEATURES[moduleKey]

  const projects = await db
    .select()
    .from(project)
    .where(eq(project.userId, session.user.id))
    .orderBy(desc(project.createdAt))

  const activeProjects = projects.filter((p) => {
    const modules = (p.modules as Record<string, boolean>) ?? {}
    return modules[MODULE_DB_FIELD[moduleKey]]
  })
  const inactiveProjects = projects.filter((p) => {
    const modules = (p.modules as Record<string, boolean>) ?? {}
    return !modules[MODULE_DB_FIELD[moduleKey]]
  })

  const priceFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'eur',
    minimumFractionDigits: 0,
  }).format(config.amount / 100)

  return (
    <div className='h-full overflow-y-auto p-5 md:p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='flex items-start gap-4 mb-8'>
          <div className='rounded-2xl bg-[#c9a96e]/10 p-4'>
            <Icon className='size-8 text-[#c9a96e]' />
          </div>
          <div>
            <h1
              className='text-2xl font-bold text-[#1a1a2e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              {config.label}
            </h1>
            <p className='text-sm text-[#8a8a96] mt-1'>{config.description}</p>
          </div>
        </div>

        <div className='grid gap-5'>
          {/* Price + features row */}
          <div className='grid md:grid-cols-2 gap-5'>
            {/* Price card */}
            <div className='glass-dark rounded-2xl p-6 text-white'>
              <p className='text-xs text-white/50 uppercase tracking-wide font-medium'>Tarif par projet</p>
              <p
                className='text-4xl font-bold mt-2'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {priceFormatted}
              </p>
              <p className='text-xs text-white/40 mt-2'>Paiement unique, pas d&apos;abonnement</p>
              <div className='mt-5 rounded-xl bg-white/10 p-3 flex items-center gap-3'>
                <Icon className='size-6 text-[#c9a96e]' />
                <span className='text-sm text-white/80'>Module activé par projet</span>
              </div>
            </div>

            {/* Features card */}
            <div className='glass-card rounded-2xl p-6'>
              <h2
                className='font-semibold text-[#1a1a2e] mb-4'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Ce qui est inclus
              </h2>
              <div className='grid gap-2.5'>
                {features.map((feature) => (
                  <div key={feature} className='flex items-center gap-3'>
                    <div className='size-6 rounded-full bg-[#c9a96e]/10 flex items-center justify-center shrink-0'>
                      <Check className='size-3.5 text-[#c9a96e]' />
                    </div>
                    <span className='text-sm text-[#1a1a2e]'>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active projects */}
          {activeProjects.length > 0 && (
            <div className='glass-card rounded-2xl p-6'>
              <h2
                className='font-semibold text-[#1a1a2e] mb-1'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Projets avec ce module
              </h2>
              <p className='text-xs text-[#8a8a96] mb-4'>
                {activeProjects.length} projet{activeProjects.length > 1 ? 's' : ''} actif{activeProjects.length > 1 ? 's' : ''}
              </p>
              <div className='grid gap-2'>
                {activeProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}/overview`}
                    className='group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/50'
                  >
                    <div className='rounded-lg bg-emerald-100/60 p-2'>
                      <Check className='size-4 text-emerald-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-[#1a1a2e] truncate'>{p.title}</p>
                      <p className='text-xs text-[#8a8a96]'>
                        {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <ArrowRight className='size-4 text-transparent group-hover:text-[#8a8a96] transition-all' />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Inactive projects — unlock */}
          {inactiveProjects.length > 0 && (
            <div className='glass-card rounded-2xl p-6'>
              <h2
                className='font-semibold text-[#1a1a2e] mb-1'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Débloquer pour un projet
              </h2>
              <p className='text-xs text-[#8a8a96] mb-4'>
                {inactiveProjects.length} projet{inactiveProjects.length > 1 ? 's' : ''} sans ce module
              </p>
              <div className='grid gap-2'>
                {inactiveProjects.map((p) => (
                  <div
                    key={p.id}
                    className='flex items-center gap-3 rounded-xl p-3 bg-white/30 border border-white/50'
                  >
                    <div className='rounded-lg bg-white/50 p-2'>
                      <Lock className='size-4 text-[#8a8a96]' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-[#1a1a2e] truncate'>{p.title}</p>
                      <p className='text-xs text-[#8a8a96]'>
                        {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/projects/${p.id}/overview`}
                      className='shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-4 py-2 text-xs font-medium text-white shadow-[0_2px_12px_rgba(201,169,110,0.25)] hover:shadow-[0_4px_20px_rgba(201,169,110,0.35)] hover:brightness-110 transition-all'
                    >
                      <Lock className='size-3' />
                      Débloquer
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No projects */}
          {projects.length === 0 && (
            <div className='glass-card rounded-2xl p-8 text-center'>
              <div className='rounded-2xl bg-white/50 p-4 inline-flex mb-4'>
                <FolderKanban className='size-8 text-[#8a8a96]' />
              </div>
              <h2
                className='font-semibold text-[#1a1a2e] mb-2'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Aucun projet
              </h2>
              <p className='text-sm text-[#8a8a96] mb-6'>
                Créez votre premier projet pour débloquer ce module.
              </p>
              <Link
                href='/questionnaire'
                className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-6 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(201,169,110,0.3)] hover:shadow-[0_8px_32px_rgba(201,169,110,0.4)] hover:brightness-110 transition-all'
              >
                <Plus className='size-4' />
                Démarrer un projet
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
