import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusBadgeVariant = 'positive' | 'negative' | 'neutral'

interface StatusBadgeProps {
  label: string
  variant?: StatusBadgeVariant
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  positive:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  negative: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  neutral: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn(variantClasses[variant])}>
      {label}
    </Badge>
  )
}
