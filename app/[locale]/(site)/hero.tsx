import Link from 'next/link'

const Hero = () => {
  return (
    <section className='pt-40 pb-24 md:pt-48 md:pb-32 lg:pt-52 lg:pb-36 bg-[#F7F6F5]'>
      <div className='max-w-4xl mx-auto px-6'>
        <div className='flex flex-col items-center text-center'>
          <h1
            className='text-[36px] md:text-[56px] lg:text-[72px] font-bold text-[#202020] leading-[1.1] mb-6 md:mb-8'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', letterSpacing: '-1px' }}
          >
            Votre r&eacute;novation, pilot&eacute;e du d&eacute;but &agrave; la fin.
          </h1>

          <p className='text-base md:text-lg text-[#626262] mb-10 md:mb-12 max-w-2xl leading-relaxed'>
            D&eacute;crivez votre projet en quelques minutes. Recevez une fiche projet
            structur&eacute;e gratuitement. Un chef de projet vous accompagne pour
            s&eacute;lectionner les artisans et suivre les travaux.
          </p>

          <Link
            href='/questionnaire'
            className='inline-flex items-center justify-center bg-[#c9a96e] text-white rounded-full text-lg font-medium hover:bg-[#b8944f] transition-colors min-w-[260px] h-[60px] px-10'
          >
            D&eacute;crire mon projet
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
