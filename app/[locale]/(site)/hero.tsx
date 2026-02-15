'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Star, Users } from 'lucide-react'

const Hero = () => {
  return (
    <section className='relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#fafaf8] overflow-hidden'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='max-w-3xl mx-auto text-center'>
          <div className='inline-flex items-center gap-2 rounded-full border border-[#e8e4df] bg-white/80 px-4 py-2 mb-8'>
            <span className='size-2 rounded-full bg-[#c9a96e] animate-pulse' />
            <span className='text-xs font-medium text-[#6b6b6b]'>
              Gratuit pour démarrer &middot; Sans engagement &middot; Toute la France
            </span>
          </div>

          <h1
            className='text-4xl md:text-6xl font-bold text-[#1a1a2e] leading-[1.1] tracking-tight mb-6'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Votre rénovation, entre de{' '}
            <span className='text-[#c9a96e]'>bonnes mains</span>
          </h1>

          <p className='text-lg md:text-xl text-[#6b6b6b] mb-10 max-w-2xl mx-auto leading-relaxed'>
            Des artisans vérifiés, des devis transparents et un suivi en temps réel.
            Gradia sélectionne et coordonne les meilleurs professionnels pour votre projet.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-12'>
            <Link
              href='/questionnaire'
              className='flex items-center gap-2 bg-[#1a1a2e] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[#2d2d4e] transition-all shadow-lg shadow-[#1a1a2e]/10'
            >
              Décrivez votre projet
              <ArrowRight className='size-4' />
            </Link>
            <a
              href='#comment-ca-marche'
              className='text-sm font-medium text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors px-6 py-4'
            >
              Comment ça marche ?
            </a>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-6 text-sm text-[#9b9b9b]'>
            <div className='flex items-center gap-2'>
              <Shield className='size-4 text-[#c9a96e]' />
              <span>Artisans assurés</span>
            </div>
            <div className='flex items-center gap-2'>
              <Star className='size-4 text-[#c9a96e]' />
              <span>Avis vérifiés</span>
            </div>
            <div className='flex items-center gap-2'>
              <Users className='size-4 text-[#c9a96e]' />
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
