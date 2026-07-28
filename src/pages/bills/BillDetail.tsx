import { Link, useParams } from 'react-router-dom'
import { CreditCardIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBill } from '@/hooks/useBills'
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils'

export default function BillDetail() {
  const { id } = useParams()
  const { data: bill, isLoading, error } = useBill(id)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />
  if (!bill) return <EmptyState text="Data tagihan tidak ditemukan" />

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader
        title="Detail Tagihan"
        description="Informasi tagihan. Data tidak dapat diubah atau dihapus."
        breadcrumbs={[
          { label: 'Tagihan', to: '/bills' },
          { label: `${bill.fee_type.name} — ${bill.house.house_number}` },
        ]}
        backTo="/bills"
        action={
          !bill.is_paid ? (
            <Button
              render={
                <Link
                  to={`/payments/new?house_id=${bill.house.id}&bill_ids=${bill.id}`}
                />
              }
            >
              <CreditCardIcon data-icon="inline-start" />
              Catat Pembayaran
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>
            {bill.fee_type.name} — {bill.house.house_number}
          </CardTitle>
          <StatusBadge
            label={bill.is_paid ? 'Lunas' : 'Belum lunas'}
            variant={bill.is_paid ? 'positive' : 'negative'}
          />
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Rumah</dt>
              <dd className="font-medium">{bill.house.house_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Jenis Iuran</dt>
              <dd className="font-medium">{bill.fee_type.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Jatuh Tempo</dt>
              <dd>{formatDate(bill.due_date)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Nominal</dt>
              <dd className="font-medium">{formatCurrency(bill.amount)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dibuat Pada</dt>
              <dd>{formatDate(bill.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Tipe Iuran</dt>
              <dd>
                {bill.fee_type.is_recurring ? 'Rutin bulanan' : 'Sekali jalan'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
