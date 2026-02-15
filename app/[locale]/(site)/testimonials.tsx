import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Marie L.',
    location: 'Paris 11e',
    text: 'Gradia a trouvé les artisans parfaits pour notre rénovation d\'appartement. Le suivi en temps réel est un vrai plus.',
    rating: 5,
    project: 'Rénovation complète 65m²',
  },
  {
    name: 'Thomas D.',
    location: 'Lyon',
    text: 'Comparer les devis côte à côte m\'a fait économiser 15%. Et le paiement par jalons, c\'est rassurant.',
    rating: 5,
    project: 'Cuisine + salle de bain',
  },
  {
    name: 'Sophie & Marc',
    location: 'Bordeaux',
    text: 'On avait peur de se lancer. Gradia nous a guidés du questionnaire jusqu\'à la livraison. Résultat impeccable.',
    rating: 5,
    project: 'Rénovation maison 120m²',
  },
]

const Testimonials = () => {
  return (
    <section className='py-20 md:py-28 bg-[#fafaf8]'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <p className='text-sm font-medium text-[#c9a96e] mb-3 uppercase tracking-wider'>Témoignages</p>
          <h2
            className='text-3xl md:text-4xl font-bold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Ils nous font confiance
          </h2>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className='rounded-2xl border border-[#e8e4df] bg-white p-6'>
              <div className='flex items-center gap-1 mb-4'>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className='size-4 text-[#c9a96e] fill-[#c9a96e]' />
                ))}
              </div>
              <p className='text-sm text-[#6b6b6b] leading-relaxed mb-4'>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className='border-t border-[#f5f3f0] pt-4'>
                <p className='text-sm font-medium text-[#1a1a2e]'>{t.name}</p>
                <p className='text-xs text-[#9b9b9b]'>{t.location} &middot; {t.project}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
