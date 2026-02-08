'use client'

import { useTranslations } from 'next-intl'
import { MessageSquareText, FileText, UserCheck } from 'lucide-react'

const steps = [
  {
    icon: MessageSquareText,
    titleKey: 'STEP_1_TITLE',
    descKey: 'STEP_1_DESC',
    number: '01',
  },
  {
    icon: FileText,
    titleKey: 'STEP_2_TITLE',
    descKey: 'STEP_2_DESC',
    number: '02',
  },
  {
    icon: UserCheck,
    titleKey: 'STEP_3_TITLE',
    descKey: 'STEP_3_DESC',
    number: '03',
  },
] as const

export default function HowItWorks() {
  const t = useTranslations()

  return (
    <section id='comment-ca-marche' className='py-24 bg-[#fafaf8]'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='mx-auto max-w-4xl'>
          <p
            className='text-center text-sm font-medium tracking-widest text-[#c9a96e] uppercase mb-4'
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {t('HOW_IT_WORKS_LABEL')}
          </p>
          <h2
            className='text-center text-3xl font-bold tracking-tight text-[#1a1a2e] mb-4 sm:text-4xl'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {t('HOW_IT_WORKS_TITLE')}
          </h2>
          <p className='text-center text-[#6b6b6b] mb-16 max-w-2xl mx-auto'>
            Un parcours simple et structuré pour transformer votre idée de rénovation en projet concret.
          </p>

          <div className='grid md:grid-cols-3 gap-8'>
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className='relative p-8 rounded-sm border border-[#e8e4df] bg-white/50'
                >
                  <span
                    className='text-5xl font-bold text-[#f0ede8] absolute top-4 right-6'
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                  >
                    {step.number}
                  </span>
                  <div className='h-10 w-10 rounded-sm bg-[#1a1a2e] flex items-center justify-center mb-6'>
                    <Icon className='h-5 w-5 text-[#c9a96e]' />
                  </div>
                  <h3 className='text-lg font-semibold text-[#1a1a2e] mb-3'>
                    {t(step.titleKey)}
                  </h3>
                  <p className='text-sm text-[#6b6b6b] leading-relaxed'>
                    {t(step.descKey)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
