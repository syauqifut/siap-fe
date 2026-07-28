import { useParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePayment } from '@/hooks/usePayments'
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils'

export default function PaymentDetail() {
  const { id } = useParams()
  const { data: payment, isLoading, error } = usePayment(id)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />
  if (!payment) return <EmptyState text="Data pembayaran tidak ditemukan" />

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader
        title="Detail Pembayaran"
        description="Informasi catatan pembayaran. Data tidak dapat diubah atau dihapus."
        breadcrumbs={[
          { label: 'Pembayaran', to: '/payments' },
          { label: `#${payment.id}` },
        ]}
        backTo="/payments"
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {payment.resident.full_name} — {payment.house.house_number}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Penghuni</dt>
              <dd className="font-medium">{payment.resident.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Rumah</dt>
              <dd className="font-medium">{payment.house.house_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Tanggal Pembayaran
              </dt>
              <dd>{formatDate(payment.payment_date)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Total</dt>
              <dd className="font-medium">
                {formatCurrency(payment.total_amount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dicatat Pada</dt>
              <dd>{formatDate(payment.created_at)}</dd>
            </div>
            {payment.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Catatan</dt>
                <dd>{payment.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          {payment.details.length === 0 ? (
            <EmptyState text="Tidak ada detail tagihan" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Jenis Iuran</TableHead>
                  <TableHead className="w-36">Jatuh Tempo</TableHead>
                  <TableHead className="w-36 text-right">Dibayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payment.details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {detail.bill.fee_type.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(detail.bill.due_date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatCurrency(detail.paid_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
