import { CircleAlertIcon } from 'lucide-react'

interface ErrorMessageProps {
  message?: string
}

export function ErrorMessage({
  message = 'Terjadi kesalahan. Silakan coba lagi.',
}: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <CircleAlertIcon className="size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
