import { LoaderCircleIcon } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Memuat...</span>
    </div>
  )
}
