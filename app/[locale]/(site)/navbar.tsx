'use client'

import Link from 'next/link'
import { X, Menu } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className='fixed inset-x-0 top-0 z-30 border-b border-[#e8e4df] bg-[#fafaf8]/95 backdrop-blur-sm'>
      <div className='mx-auto max-w-7xl flex h-14 items-center justify-between gap-8 px-4 sm:px-6'>
        <div className='flex items-center gap-3'>
          <Link href='/' className='flex items-center gap-2'>
            <span
              className='text-lg font-bold text-[#1a1a2e] tracking-tight'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Gradia
            </span>
          </Link>
        </div>

        <div className='flex-1' />

        <div className='flex items-center gap-6'>
          <div className='hidden items-center gap-6 md:flex'>
            <Link
              href='/#comment-ca-marche'
              className='text-sm font-medium text-[#6b6b6b] transition-colors duration-200 hover:text-[#1a1a2e]'
            >
              {t('NAV_HOW_IT_WORKS')}
            </Link>
            <Link
              href='/login'
              className='text-sm font-medium text-[#6b6b6b] transition-colors duration-200 hover:text-[#1a1a2e]'
            >
              {t('NAV_LOGIN')}
            </Link>
          </div>

          <Link href='/questionnaire'>
            <Button className='hidden md:flex bg-[#1a1a2e] text-white hover:bg-[#16213e] h-9 px-5 text-sm font-medium'>
              {t('NAV_START_PROJECT')}
            </Button>
          </Link>

          <button
            type='button'
            onClick={toggleMenu}
            className='inline-flex items-center justify-center rounded-md p-2 text-[#6b6b6b] transition-colors hover:bg-[#f0ede8] hover:text-[#1a1a2e] md:hidden'
          >
            <span className='sr-only'>Menu</span>
            {isMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className='border-t border-[#e8e4df] md:hidden'>
          <div className='mx-auto max-w-6xl space-y-1 px-4 sm:px-6 pb-3 pt-2'>
            <Link
              href='/#comment-ca-marche'
              className='block rounded-md px-3 py-2 text-sm font-medium text-[#6b6b6b] transition-all duration-200 hover:bg-[#f0ede8] hover:text-[#1a1a2e]'
              onClick={toggleMenu}
            >
              {t('NAV_HOW_IT_WORKS')}
            </Link>
            <Link
              href='/login'
              className='block rounded-md px-3 py-2 text-sm font-medium text-[#6b6b6b] transition-all duration-200 hover:bg-[#f0ede8] hover:text-[#1a1a2e]'
              onClick={toggleMenu}
            >
              {t('NAV_LOGIN')}
            </Link>
            <div className='px-3 pt-2'>
              <Link href='/questionnaire' onClick={toggleMenu}>
                <Button className='w-full bg-[#1a1a2e] text-white hover:bg-[#16213e] h-10 text-sm font-medium'>
                  {t('NAV_START_PROJECT')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
