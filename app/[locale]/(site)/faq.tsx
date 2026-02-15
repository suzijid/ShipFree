'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    question: 'C\'est vraiment gratuit pour démarrer ?',
    answer: 'Oui. Le questionnaire, la fiche projet par IA, le rendez-vous de cadrage et la sélection des artisans sont entièrement gratuits. Vous ne payez que lorsque vous acceptez un devis et que les travaux commencent.',
  },
  {
    question: 'Comment sont sélectionnés les artisans ?',
    answer: 'Chaque artisan de notre réseau est vérifié : assurance professionnelle à jour, certifications, et avis clients vérifiés. Notre équipe les sélectionne manuellement en fonction de votre projet.',
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer: 'Les paiements sont sécurisés via Stripe Connect et se font par jalons. Vous payez au fur et à mesure de l\'avancement des travaux, jamais en une seule fois. Gradia prélève une commission de 10% incluse dans le montant.',
  },
  {
    question: 'Combien de temps prend le processus ?',
    answer: 'Le questionnaire prend 5-10 minutes. Vous recevez des propositions d\'artisans sous 48-72h. Le délai total dépend de la nature de votre projet.',
  },
  {
    question: 'Quelles garanties ai-je ?',
    answer: 'Tous nos artisans sont assurés. Le paiement par jalons protège votre investissement. Le dashboard vous donne une visibilité totale sur l\'avancement. Et notre équipe vous accompagne en cas de problème.',
  },
  {
    question: 'Quels types de travaux gérez-vous ?',
    answer: 'Rénovations complètes, cuisines, salles de bain, plomberie, électricité, peinture, sols, façade, isolation... Nous couvrons tous les corps de métier du bâtiment pour les projets à partir de 5 000 €.',
  },
  {
    question: 'Puis-je choisir mes artisans ?',
    answer: 'Absolument. Nous vous proposons les artisans les plus adaptés, mais c\'est vous qui acceptez ou refusez chaque devis. Vous gardez le contrôle total.',
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id='faq' className='py-20 md:py-28 bg-[#fafaf8]'>
      <div className='max-w-3xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <p className='text-sm font-medium text-[#c9a96e] mb-3 uppercase tracking-wider'>FAQ</p>
          <h2
            className='text-3xl md:text-4xl font-bold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Questions fréquentes
          </h2>
        </div>

        <div className='space-y-3'>
          {FAQS.map((faq, i) => (
            <div key={i} className='rounded-2xl border border-[#e8e4df] bg-white overflow-hidden'>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className='flex items-center justify-between w-full px-6 py-4 text-left'
              >
                <span className='text-sm font-medium text-[#1a1a2e] pr-4'>{faq.question}</span>
                <ChevronDown
                  className={`size-5 text-[#9b9b9b] shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className='px-6 pb-4'>
                  <p className='text-sm text-[#6b6b6b] leading-relaxed'>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
