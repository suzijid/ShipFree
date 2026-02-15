import { Shield, CreditCard, Activity, UserCheck, FileText, MessageSquare } from 'lucide-react'

const FEATURES = [
  {
    icon: UserCheck,
    title: 'Artisans vérifiés',
    description: 'Chaque artisan est vérifié : assurance, certifications, avis clients. Vous travaillez uniquement avec des professionnels de confiance.',
  },
  {
    icon: CreditCard,
    title: 'Paiement sécurisé',
    description: 'Paiements par jalons via Stripe Connect. Vous payez au fur et à mesure de l\'avancement, en toute sécurité.',
  },
  {
    icon: Activity,
    title: 'Suivi en temps réel',
    description: 'Dashboard dédié avec l\'avancement de votre chantier, les documents partagés et les prochaines étapes.',
  },
  {
    icon: Shield,
    title: 'Accompagnement expert',
    description: 'Questionnaire intelligent + fiche projet structurée gratuitement. Notre équipe vous guide dans chaque décision.',
  },
  {
    icon: FileText,
    title: 'Devis transparents',
    description: 'Comparez les propositions de plusieurs artisans. Détail des prestations, prix et délais — tout est clair.',
  },
  {
    icon: MessageSquare,
    title: 'Communication centralisée',
    description: 'Messagerie intégrée avec tous vos artisans. Fini les appels perdus et les emails éparpillés.',
  },
]

export default function Features() {
  return (
    <section id='garanties' className='py-20 md:py-28 bg-[#fafaf8]'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <p className='text-sm font-medium text-[#c9a96e] mb-3 uppercase tracking-wider'>Garanties Gradia</p>
          <h2
            className='text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Votre tranquillité, notre priorité
          </h2>
          <p className='text-[#6b6b6b] max-w-xl mx-auto'>
            Gradia s&apos;occupe de tout : de la sélection des artisans au suivi du chantier.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className='group p-6 rounded-2xl border border-[#e8e4df] bg-white hover:border-[#c9a96e]/30 hover:shadow-lg hover:shadow-[#c9a96e]/5 transition-all'
            >
              <div className='flex items-center justify-center size-12 rounded-xl bg-[#f5f3f0] group-hover:bg-[#c9a96e]/10 transition-colors mb-4'>
                <feature.icon className='size-6 text-[#c9a96e]' />
              </div>
              <h3 className='text-base font-semibold text-[#1a1a2e] mb-2'>{feature.title}</h3>
              <p className='text-sm text-[#6b6b6b] leading-relaxed'>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
