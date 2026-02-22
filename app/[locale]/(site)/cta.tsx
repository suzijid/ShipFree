import Link from 'next/link'

export default function CTA() {
  return (
    <section className='py-20 md:py-28 px-6 bg-[#202020]'>
      <div className='mx-auto max-w-2xl text-center'>
        <h2
          className='text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Pr&ecirc;t &agrave; d&eacute;marrer votre projet ?
        </h2>
        <p className='text-base text-white/60 mb-10 max-w-lg mx-auto'>
          D&eacute;crivez votre r&eacute;novation en 5 minutes et recevez votre fiche projet gratuite.
        </p>
        <Link
          href='/questionnaire'
          className='inline-flex items-center justify-center bg-[#c9a96e] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[#b8944f] transition-colors'
        >
          D&eacute;crire mon projet
        </Link>
      </div>
    </section>
  )
}
