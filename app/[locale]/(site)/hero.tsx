'use client'

import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Hero() {
  const t = useTranslations()

  return (
    <main
      id='hero'
      className='flex min-h-screen flex-col items-center justify-start pt-32 pb-24 bg-[#fafaf8]'
    >
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
        <div className='mx-auto max-w-3xl text-center'>
          <p
            className='mb-6 text-sm font-medium tracking-widest text-[#c9a96e] uppercase'
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            Maîtrise d'oeuvre digitale
          </p>

          <h1
            className='text-balance text-4xl font-bold leading-tight tracking-tight text-[#1a1a2e] sm:text-5xl md:text-6xl lg:leading-[1.1]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {t('HERO_TITLE')}
          </h1>

          <p className='mx-auto mt-6 max-w-xl text-balance text-[#6b6b6b] md:text-lg leading-relaxed'>
            {t('HERO_SUBTITLE')}
          </p>

          <div className='mx-auto mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link href='/questionnaire'>
              <Button className='bg-[#1a1a2e] text-white hover:bg-[#16213e] h-12 px-8 text-base font-semibold group'>
                {t('HERO_CTA')}
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Button>
            </Link>
            <Link href='/#comment-ca-marche'>
              <Button variant='outline' className='h-12 px-8 text-base font-medium border-[#e8e4df] text-[#1a1a2e] hover:bg-[#f0ede8]'>
                {t('HERO_CTA_SECONDARY')}
              </Button>
            </Link>
          </div>

          <div className='mt-16 flex items-center justify-center gap-8 text-sm text-[#9b9b9b]'>
            <span>Gratuit pour démarrer</span>
            <span className='h-1 w-1 rounded-full bg-[#d4d0cb]' />
            <span>Sans engagement</span>
            <span className='h-1 w-1 rounded-full bg-[#d4d0cb]' />
            <span>Toute la France</span>
          </div>
        </div>
      </div>
    </main>
  )
}
