import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'accent' | 'blue' | 'orange' | 'purple'
}

const variantStyles = {
  default: 'border-l-4 border-l-transparent',
  accent: 'border-l-4 border-l-accent shadow-glow',
  blue: 'border-l-4 border-l-accent2 shadow-glow-blue',
  orange: 'border-l-4 border-l-accent3',
  purple: 'border-l-4 border-l-accent4',
}

export default function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
