import { cn } from '@/lib/utils'

interface BadgeProps {
  status: string
  children?: React.ReactNode
  className?: string
}

export default function Badge({ status, children, className }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${status}`, className)}>
      {children ?? status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  )
}
