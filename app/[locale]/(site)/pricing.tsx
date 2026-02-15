import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

const Pricing = () => {
  return (
    <section id='tarifs' className='py-20 md:py-28 bg-[#fafaf8]'>
      <div className='max-w-4xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <p className='text-sm font-medium text-[#c9a96e] mb-3 uppercase tracking-wider'>Tarifs</p>
          <h2
            className='text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Comment ça marche financièrement
          </h2>
          <p className='text-[#6b6b6b] max-w-xl mx-auto'>
            Gratuit pour démarrer. Transparent à chaque étape.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='rounded-2xl border border-[#e8e4df] bg-white p-8'>
            <h3 className='text-xl font-semibold text-[#1a1a2e] mb-2'>Démarrage gratuit</h3>
            <p className='text-3xl font-bold text-[#1a1a2e] mb-1'>0 €</p>
            <p className='text-sm text-[#9b9b9b] mb-6'>Pour lancer votre projet</p>
            <ul className='space-y-3 mb-8'>
              {[
                'Questionnaire intelligent',
                'Fiche projet structurée par IA',
                'Rendez-vous de cadrage',
                'Sélection d\'artisans vérifiés',
                'Comparaison des devis',
              ].map((item, i) => (
                <li key={i} className='flex items-start gap-3 text-sm text-[#6b6b6b]'>
                  <Check className='size-4 text-[#c9a96e] mt-0.5 shrink-0' />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href='/questionnaire'
              className='flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full border border-[#e8e4df] text-sm font-medium text-[#1a1a2e] hover:bg-[#f5f3f0] transition-colors'
            >
              Commencer gratuitement
              <ArrowRight className='size-4' />
            </Link>
          </div>

          <div className='rounded-2xl border-2 border-[#c9a96e] bg-white p-8 relative'>
            <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a96e] text-white text-xs font-bold px-4 py-1 rounded-full'>
              Transparent
            </div>
            <h3 className='text-xl font-semibold text-[#1a1a2e] mb-2'>Commission Gradia</h3>
            <p className='text-3xl font-bold text-[#1a1a2e] mb-1'>10%</p>
            <p className='text-sm text-[#9b9b9b] mb-6'>Sur les paiements aux artisans</p>
            <ul className='space-y-3 mb-8'>
              {[
                'Tout le gratuit inclus',
                'Paiement sécurisé par jalons',
                'Dashboard de suivi en temps réel',
                'Messagerie centralisée',
                'Gestion des documents',
                'Coordination complète du chantier',
              ].map((item, i) => (
                <li key={i} className='flex items-start gap-3 text-sm text-[#6b6b6b]'>
                  <Check className='size-4 text-[#c9a96e] mt-0.5 shrink-0' />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href='/questionnaire'
              className='flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors'
            >
              Démarrer mon projet
              <ArrowRight className='size-4' />
            </Link>
          </div>
        </div>

        <p className='text-center text-xs text-[#9b9b9b] mt-8'>
          Pas de frais cachés. La commission Gradia est incluse dans le montant que vous payez — les artisans reçoivent le montant convenu dans leur devis.
        </p>
      </div>
    </section>
  )
}

export default Pricing
