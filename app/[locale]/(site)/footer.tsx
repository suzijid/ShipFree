import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='py-12 bg-[#1a1a2e] text-white'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-4 gap-8 mb-10'>
          <div>
            <Link href='/' className='flex items-center gap-2 mb-4'>
              <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white'>
                <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
              </div>
              <span
                className='text-lg font-semibold'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Gradia
              </span>
            </Link>
            <p className='text-sm text-white/60'>
              La plateforme qui connecte les meilleurs artisans à vos projets de rénovation.
            </p>
          </div>

          <div>
            <h4 className='text-sm font-semibold mb-4'>Plateforme</h4>
            <ul className='space-y-2'>
              <li><a href='#comment-ca-marche' className='text-sm text-white/60 hover:text-white transition-colors'>Comment ça marche</a></li>
              <li><a href='#garanties' className='text-sm text-white/60 hover:text-white transition-colors'>Garanties</a></li>
              <li><a href='#tarifs' className='text-sm text-white/60 hover:text-white transition-colors'>Tarifs</a></li>
              <li><a href='#faq' className='text-sm text-white/60 hover:text-white transition-colors'>FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold mb-4'>Légal</h4>
            <ul className='space-y-2'>
              <li><Link href='/mentions-legales' className='text-sm text-white/60 hover:text-white transition-colors'>Mentions légales</Link></li>
              <li><Link href='/confidentialite' className='text-sm text-white/60 hover:text-white transition-colors'>Politique de confidentialité</Link></li>
              <li><Link href='/cgv' className='text-sm text-white/60 hover:text-white transition-colors'>CGV</Link></li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold mb-4'>Commencer</h4>
            <ul className='space-y-2'>
              <li><Link href='/questionnaire' className='text-sm text-white/60 hover:text-white transition-colors'>Décrire mon projet</Link></li>
              <li><Link href='/login' className='text-sm text-white/60 hover:text-white transition-colors'>Se connecter</Link></li>
            </ul>
          </div>
        </div>

        <div className='border-t border-white/10 pt-6 text-center'>
          <p className='text-xs text-white/40'>
            © {new Date().getFullYear()} Gradia. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
