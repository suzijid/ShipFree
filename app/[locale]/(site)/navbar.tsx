'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className='fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#E4E0DE]/60'>
      <div className='max-w-6xl mx-auto px-6 h-16 md:h-[72px] flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-sm'>
            <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
          </div>
          <span
            className='text-lg font-semibold text-[#202020]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Gradia
          </span>
        </Link>

        <nav className='hidden md:flex items-center gap-8'>
          <a href='#comment-ca-marche' className='text-sm text-[#626262] hover:text-[#202020] transition-colors'>
            Comment &ccedil;a marche
          </a>
          <a href='#faq' className='text-sm text-[#626262] hover:text-[#202020] transition-colors'>
            FAQ
          </a>
        </nav>

        <div className='hidden md:flex items-center gap-3'>
          <Link
            href='/login'
            className='text-sm text-[#626262] hover:text-[#202020] transition-colors px-3 py-2'
          >
            Connexion
          </Link>
          <Link
            href='/questionnaire'
            className='text-sm font-medium bg-[#c9a96e] text-white px-5 py-2.5 rounded-full hover:bg-[#b8944f] transition-colors'
          >
            D&eacute;crire mon projet
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className='md:hidden p-2'>
          {open ? <X className='size-5 text-[#202020]' /> : <Menu className='size-5 text-[#202020]' />}
        </button>
      </div>

      {open && (
        <div className='md:hidden bg-white border-t border-[#E4E0DE] px-6 py-4 space-y-3'>
          <a href='#comment-ca-marche' onClick={() => setOpen(false)} className='block text-sm text-[#626262] py-2'>Comment &ccedil;a marche</a>
          <a href='#faq' onClick={() => setOpen(false)} className='block text-sm text-[#626262] py-2'>FAQ</a>
          <div className='pt-2 border-t border-[#CDC3B9] space-y-2'>
            <Link href='/login' className='block text-sm text-[#626262] py-2'>Connexion</Link>
            <Link
              href='/questionnaire'
              className='block text-center text-sm font-medium bg-[#c9a96e] text-white px-5 py-2.5 rounded-full'
            >
              D&eacute;crire mon projet
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
