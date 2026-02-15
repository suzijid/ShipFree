'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className='fixed top-0 inset-x-0 z-50 bg-[#fafaf8]/80 backdrop-blur-lg border-b border-[#e8e4df]/50'>
      <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-sm'>
            <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
          </div>
          <span
            className='text-lg font-semibold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Gradia
          </span>
        </Link>

        <nav className='hidden md:flex items-center gap-8'>
          <a href='#comment-ca-marche' className='text-sm text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors'>
            Comment ça marche
          </a>
          <a href='#garanties' className='text-sm text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors'>
            Garanties
          </a>
          <a href='#tarifs' className='text-sm text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors'>
            Tarifs
          </a>
          <a href='#faq' className='text-sm text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors'>
            FAQ
          </a>
        </nav>

        <div className='hidden md:flex items-center gap-3'>
          <Link
            href='/login'
            className='text-sm text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors px-3 py-2'
          >
            Connexion
          </Link>
          <Link
            href='/questionnaire'
            className='text-sm font-medium bg-[#1a1a2e] text-white px-5 py-2.5 rounded-full hover:bg-[#2d2d4e] transition-colors'
          >
            Commencer
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className='md:hidden p-2'>
          {open ? <X className='size-5 text-[#1a1a2e]' /> : <Menu className='size-5 text-[#1a1a2e]' />}
        </button>
      </div>

      {open && (
        <div className='md:hidden bg-[#fafaf8] border-t border-[#e8e4df] px-6 py-4 space-y-3'>
          <a href='#comment-ca-marche' onClick={() => setOpen(false)} className='block text-sm text-[#6b6b6b] py-2'>Comment ça marche</a>
          <a href='#garanties' onClick={() => setOpen(false)} className='block text-sm text-[#6b6b6b] py-2'>Garanties</a>
          <a href='#tarifs' onClick={() => setOpen(false)} className='block text-sm text-[#6b6b6b] py-2'>Tarifs</a>
          <a href='#faq' onClick={() => setOpen(false)} className='block text-sm text-[#6b6b6b] py-2'>FAQ</a>
          <div className='pt-2 border-t border-[#e8e4df] space-y-2'>
            <Link href='/login' className='block text-sm text-[#6b6b6b] py-2'>Connexion</Link>
            <Link
              href='/questionnaire'
              className='block text-center text-sm font-medium bg-[#1a1a2e] text-white px-5 py-2.5 rounded-full'
            >
              Commencer
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
