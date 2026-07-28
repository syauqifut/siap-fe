import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  text?: string
}

export function EmptyState({ text = 'Belum ada data' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <InboxIcon className="size-8" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
