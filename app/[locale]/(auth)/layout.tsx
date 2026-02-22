import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-svh bg-white flex flex-col items-center'>
      {/* Logo */}
      <div className='pt-12 pb-8'>
        <Link href='/' className='flex items-center gap-3'>
          <span className='text-[28px] font-bold text-[#b8960c] leading-none'>G</span>
          <span className='text-[14px] font-light tracking-[0.35em] text-[#202020] uppercase'>
            Gradia
          </span>
        </Link>
      </div>

      {/* Content */}
      <main className='flex flex-1 w-full items-center justify-center px-4 pb-24'>
        <div className='w-full max-w-md'>{children}</div>
      </main>
    </div>
  )
}
