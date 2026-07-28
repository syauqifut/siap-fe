import { EmptyState } from '@/components/shared/EmptyState'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Bill } from '@/types/bill'

interface UnpaidBillMultiSelectProps {
  id: string
  bills: Bill[]
  value: string[]
  onChange: (value: string[]) => void
  invalid?: boolean
  disabled?: boolean
  emptyHint?: string
}

export function UnpaidBillMultiSelect({
  id,
  bills,
  value,
  onChange,
  invalid = false,
  disabled = false,
  emptyHint,
}: UnpaidBillMultiSelectProps) {
  const handleToggle = (billId: string) => {
    if (value.includes(billId)) {
      onChange(value.filter((id) => id !== billId))
      return
    }

    onChange([...value, billId])
  }

  const handleSelectAll = () => {
    if (value.length === bills.length) {
      onChange([])
      return
    }

    onChange(bills.map((bill) => String(bill.id)))
  }

  if (bills.length === 0) {
    return (
      <div className="space-y-2">
        <EmptyState text="Tidak ada tagihan belum lunas untuk rumah ini" />
        {emptyHint && (
          <p className="text-center text-xs text-muted-foreground">{emptyHint}</p>
        )}
      </div>
    )
  }

  const totalSelected = bills
    .filter((bill) => value.includes(String(bill.id)))
    .reduce((sum, bill) => sum + Number(bill.amount), 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>Tagihan Belum Lunas</Label>
        <button
          type="button"
          className="text-xs text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
          disabled={disabled}
          onClick={handleSelectAll}
        >
          {value.length === bills.length ? 'Batalkan semua' : 'Pilih semua'}
        </button>
      </div>

      <div
        id={id}
        aria-invalid={invalid}
        className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-input p-3"
      >
        {bills.map((bill) => {
          const billId = String(bill.id)
          const isChecked = value.includes(billId)

          return (
            <label
              key={bill.id}
              className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50 has-disabled:cursor-not-allowed has-disabled:opacity-50"
            >
              <input
                type="checkbox"
                className="mt-1 accent-primary"
                checked={isChecked}
                disabled={disabled}
                onChange={() => handleToggle(billId)}
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-medium">{bill.fee_type.name}</span>
                <span className="block text-muted-foreground">
                  Jatuh tempo {formatDate(bill.due_date)} ·{' '}
                  {formatCurrency(bill.amount)}
                </span>
              </span>
            </label>
          )
        })}
      </div>

      {value.length > 0 && (
        <p className="text-sm font-medium">
          Total: {formatCurrency(totalSelected)} ({value.length} tagihan)
        </p>
      )}
    </div>
  )
}
