import { PlusIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FeeType } from '@/types/feeType'

export const CREATE_NEW_SELECT_VALUE = '__create_new__'

interface FeeTypeSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  feeTypes: FeeType[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  onCreateNew?: () => void
  createLabel?: string
}

export function FeeTypeSelect({
  id,
  value,
  onChange,
  feeTypes,
  placeholder = 'Pilih jenis iuran...',
  disabled = false,
  invalid = false,
  onCreateNew,
  createLabel = 'Tambah jenis iuran baru',
}: FeeTypeSelectProps) {
  const items = feeTypes.map((feeType) => ({
    value: String(feeType.id),
    label: feeType.name,
  }))

  const handleValueChange = (nextValue: string | null) => {
    if (nextValue === CREATE_NEW_SELECT_VALUE) {
      onCreateNew?.()
      return
    }

    onChange(nextValue ?? '')
  }

  return (
    <Select
      modal={false}
      value={value || null}
      items={items}
      disabled={disabled}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        side="bottom"
        sideOffset={4}
        className="z-[60]"
      >
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
        {onCreateNew && (
          <>
            {items.length > 0 && <SelectSeparator />}
            <SelectItem
              value={CREATE_NEW_SELECT_VALUE}
              className="text-primary focus:text-primary"
            >
              <PlusIcon className="size-4" />
              {createLabel}
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
}
