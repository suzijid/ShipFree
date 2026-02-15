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
        'glass-card rounded-2xl',
        hover && 'hover:-translate-y-0.5 hover:scale-[1.003] hover:bg-white/70',
        glow && 'shadow-[0_0_24px_rgba(201,169,110,0.12)]',
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
        variant === 'ghost' && 'bg-[#f5f3f0] border border-[#e8e4df] text-[#1a1a2e] hover:bg-[#ebe8e4] hover:border-[#ddd8d2]',
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
        variant === 'default' && 'bg-gray-100 text-gray-600',
        variant === 'gold' && 'bg-[#c9a96e]/10 text-[#a0854e]',
        variant === 'success' && 'bg-emerald-50 text-emerald-600',
        variant === 'warning' && 'bg-amber-50 text-amber-600',
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
      'w-full rounded-xl border border-[#e8e4df] bg-white px-4 py-2.5 text-sm text-[#1a1a2e] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/30 focus:border-[#c9a96e]/40 transition-all',
      className,
    )}
    {...props}
  />
))
GlassInput.displayName = 'GlassInput'

// ─── GlassProgress ────────────────────────────────────────────────────────

interface GlassProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  variant?: 'gold' | 'emerald' | 'default'
  size?: 'sm' | 'md'
}

export const GlassProgress = forwardRef<HTMLDivElement, GlassProgressProps>(
  ({ className, value, variant = 'gold', size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'w-full rounded-full bg-[#f5f3f0]',
        size === 'sm' && 'h-1.5',
        size === 'md' && 'h-2.5',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          variant === 'gold' && 'bg-gradient-to-r from-[#c9a96e] to-[#b8944f] shadow-[0_0_8px_rgba(201,169,110,0.4)]',
          variant === 'emerald' && 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.35)]',
          variant === 'default' && 'bg-gradient-to-r from-gray-300 to-gray-400',
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  ),
)
GlassProgress.displayName = 'GlassProgress'

// ─── GlassSkeleton ─────────────────────────────────────────────────────────

export const GlassSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
      className,
    )}
    {...props}
  />
)
