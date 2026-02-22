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
        'glass-card',
        hover && 'hover:border-[#ccc] transition-colors',
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
        'inline-flex items-center justify-center gap-2 font-normal transition-colors disabled:opacity-50 disabled:pointer-events-none uppercase tracking-[0.1em] text-[13px]',
        variant === 'gold' && 'bg-[#202020] text-white hover:bg-[#333]',
        variant === 'ghost' && 'bg-transparent border border-[#202020] text-[#202020] hover:bg-[#f5f5f5]',
        size === 'sm' && 'px-3 py-1.5 text-xs min-h-[44px] md:min-h-0',
        size === 'md' && 'px-4 py-2 text-sm min-h-[44px] md:min-h-0',
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
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.05em]',
        variant === 'default' && 'bg-[#f5f5f5] text-[#999]',
        variant === 'gold' && 'bg-[#202020]/5 text-[#202020]',
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
      'w-full border-0 border-b border-[#e0e0e0] bg-transparent px-0 py-2.5 text-sm text-[#202020] placeholder:text-[#ccc] focus:outline-none focus:border-[#202020] transition-colors',
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
        'w-full bg-[#f5f5f5]',
        size === 'sm' && 'h-1',
        size === 'md' && 'h-2',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-500 ease-out',
          variant === 'gold' && 'bg-[#202020]',
          variant === 'emerald' && 'bg-emerald-500',
          variant === 'default' && 'bg-[#ccc]',
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
      'bg-gradient-to-r from-[#f5f5f5] via-[#e8e8e8] to-[#f5f5f5] bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
      className,
    )}
    {...props}
  />
)
