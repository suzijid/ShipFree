'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ─── GlassCard ─────────────────────────────────────────────────────────────

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-white/5 backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:border-white/[0.12] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        glow && 'shadow-[0_0_20px_rgba(201,169,110,0.08)]',
        className,
      )}
      {...props}
    />
  ),
)
GlassCard.displayName = 'GlassCard'

// ─── GlassButton ───────────────────────────────────────────────────────────

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'gold', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variant === 'gold' && 'bg-gradient-to-r from-[#c9a96e] to-[#b8944f] text-white shadow-[0_2px_12px_rgba(201,169,110,0.25)] hover:shadow-[0_4px_20px_rgba(201,169,110,0.35)] hover:brightness-110',
        variant === 'ghost' && 'bg-white/5 border border-white/[0.08] text-white/90 hover:bg-white/10 hover:border-white/[0.12]',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      {...props}
    />
  ),
)
GlassButton.displayName = 'GlassButton'

// ─── GlassBadge ────────────────────────────────────────────────────────────

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'success' | 'warning'
}

export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-white/10 text-white/70',
        variant === 'gold' && 'bg-[#c9a96e]/15 text-[#c9a96e]',
        variant === 'success' && 'bg-emerald-500/15 text-emerald-400',
        variant === 'warning' && 'bg-amber-500/15 text-amber-400',
        className,
      )}
      {...props}
    />
  ),
)
GlassBadge.displayName = 'GlassBadge'

// ─── GlassInput ────────────────────────────────────────────────────────────

export const GlassInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-xl border border-white/[0.08] bg-white/5 px-4 py-2.5 text-sm text-white/95 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/30 focus:border-[#c9a96e]/40 transition-all',
      className,
    )}
    {...props}
  />
))
GlassInput.displayName = 'GlassInput'

// ─── GlassSkeleton ─────────────────────────────────────────────────────────

export const GlassSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
      className,
    )}
    {...props}
  />
)
