import { useParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpense } from '@/hooks/useExpenses'
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils'

export default function ExpenseDetail() {
  const { id } = useParams()
  const { data: expense, isLoading, error } = useExpense(id)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />
  if (!expense) return <EmptyState text="Data pengeluaran tidak ditemukan" />

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader
        title="Detail Pengeluaran"
        description="Informasi catatan pengeluaran. Data tidak dapat diubah atau dihapus."
        breadcrumbs={[
          { label: 'Pengeluaran', to: '/expenses' },
          { label: `#${expense.id}` },
        ]}
        backTo="/expenses"
      />

      <Card>
        <CardHeader>
          <CardTitle>{expense.description}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Kategori</dt>
              <dd className="font-medium">{expense.expense_category.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Nominal</dt>
              <dd className="font-medium">{formatCurrency(expense.amount)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Tanggal Pengeluaran
              </dt>
              <dd>{formatDate(expense.expense_date)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dicatat Pada</dt>
              <dd>{formatDate(expense.created_at)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Deskripsi</dt>
              <dd>{expense.description}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
