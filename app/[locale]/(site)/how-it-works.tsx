const steps = [
  {
    number: '01',
    title: 'Décrivez votre projet',
    desc: 'Remplissez notre questionnaire en 5 minutes. Pièces, travaux souhaités, budget — on structure tout pour vous.',
  },
  {
    number: '02',
    title: 'Recevez votre fiche projet',
    desc: "Notre IA analyse vos réponses et génère une fiche projet détaillée. C'est gratuit, sans engagement.",
  },
  {
    number: '03',
    title: 'Un chef de projet vous accompagne',
    desc: "Cadrage du projet, sélection d'artisans vérifiés, suivi des travaux — vous gardez le contrôle, on gère la complexité.",
  },
]

export default function HowItWorks() {
  return (
    <section id='comment-ca-marche' className='py-20 md:py-28 bg-white'>
      <div className='mx-auto max-w-4xl px-6'>
        <h2
          className='text-2xl md:text-3xl lg:text-4xl font-bold text-[#202020] mb-14 md:mb-16'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Comment &ccedil;a marche
        </h2>

        <div className='space-y-12 md:space-y-14'>
          {steps.map((step) => (
            <div key={step.number} className='flex gap-6 md:gap-8'>
              <span
                className='text-3xl md:text-4xl font-bold text-[#c9a96e]/30 shrink-0 leading-none pt-1'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {step.number}
              </span>
              <div>
                <h3
                  className='text-lg md:text-xl font-semibold text-[#202020] mb-2'
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  {step.title}
                </h3>
                <p className='text-[#626262] leading-relaxed max-w-lg'>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
