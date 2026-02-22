interface GridLayoutProps {
  children: React.ReactNode
  className?: string
}

export const GridLayout = ({ children, className = '' }: GridLayoutProps) => {
  return <div className={`relative ${className}`}>{children}</div>
}

interface SectionDividerProps {
  className?: string
}

export const SectionDivider = ({ className = '' }: SectionDividerProps) => {
  return (
    <div className={`${className}`}>
      <div className='h-px w-full bg-[#E4E4E7]' />
    </div>
  )
}
