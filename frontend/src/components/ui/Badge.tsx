import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'blue' | 'orange' | 'purple' | 'success' | 'warning' | 'error'
  className?: string
}

const variants = {
  default: 'bg-surface2 text-muted border-border',
  accent: 'bg-accent/10 text-accent border-accent/20',
  blue: 'bg-accent2/10 text-accent2 border-accent2/20',
  orange: 'bg-accent3/10 text-accent3 border-accent3/20',
  purple: 'bg-accent4/10 text-accent4 border-accent4/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
