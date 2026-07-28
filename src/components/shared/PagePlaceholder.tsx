import {
  Card,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'

interface PagePlaceholderProps {
  description?: string
}

export function PagePlaceholder({ description }: PagePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {description ?? 'Placeholder — modul ini belum diimplementasi.'}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
