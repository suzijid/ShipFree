'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    question: "C\u2019est vraiment gratuit pour d\u00e9marrer ?",
    answer: "Oui. Le questionnaire, la fiche projet par IA, le rendez-vous de cadrage et la s\u00e9lection des artisans sont enti\u00e8rement gratuits. Vous ne payez que lorsque vous acceptez un devis et que les travaux commencent.",
  },
  {
    question: "Comment sont s\u00e9lectionn\u00e9s les artisans ?",
    answer: "Chaque artisan de notre r\u00e9seau est v\u00e9rifi\u00e9 : assurance professionnelle \u00e0 jour, certifications, et avis clients v\u00e9rifi\u00e9s. Notre \u00e9quipe les s\u00e9lectionne manuellement en fonction de votre projet.",
  },
  {
    question: "Combien de temps prend le processus ?",
    answer: "Le questionnaire prend 5-10 minutes. Vous recevez des propositions d\u2019artisans sous 48-72h. Le d\u00e9lai total d\u00e9pend de la nature de votre projet.",
  },
  {
    question: "Quelles garanties ai-je ?",
    answer: "Tous nos artisans sont assur\u00e9s. Le paiement par jalons prot\u00e8ge votre investissement. Le dashboard vous donne une visibilit\u00e9 totale sur l\u2019avancement. Et notre \u00e9quipe vous accompagne en cas de probl\u00e8me.",
  },
  {
    question: "Quels types de travaux g\u00e9rez-vous ?",
    answer: "R\u00e9novations compl\u00e8tes, cuisines, salles de bain, plomberie, \u00e9lectricit\u00e9, peinture, sols, fa\u00e7ade, isolation... Nous couvrons tous les corps de m\u00e9tier du b\u00e2timent pour les projets \u00e0 partir de 5 000 \u20ac.",
  },
  {
    question: "Puis-je choisir mes artisans ?",
    answer: "Absolument. Nous vous proposons les artisans les plus adapt\u00e9s, mais c\u2019est vous qui acceptez ou refusez chaque devis. Vous gardez le contr\u00f4le total.",
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id='faq' className='py-20 md:py-28 bg-[#F7F6F5]'>
      <div className='max-w-3xl mx-auto px-6'>
        <div className='mb-14 md:mb-16'>
          <h2
            className='text-2xl md:text-3xl lg:text-4xl font-bold text-[#202020]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Questions fr&eacute;quentes
          </h2>
        </div>

        <div className='space-y-3'>
          {FAQS.map((faq, i) => (
            <div key={i} className='rounded-2xl border border-[#E4E0DE] bg-white overflow-hidden'>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className='flex items-center justify-between w-full px-6 py-4 text-left'
              >
                <span
                  className='text-base font-semibold text-[#202020] pr-4'
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`size-5 text-[#9b9b9b] shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className='grid transition-[grid-template-rows] duration-200 ease-out'
                style={{ gridTemplateRows: openIndex === i ? '1fr' : '0fr' }}
              >
                <div className='overflow-hidden'>
                  <div className='px-6 pb-4'>
                    <p className='text-sm text-[#626262] leading-relaxed'>{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
