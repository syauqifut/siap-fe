import { PlusIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const CREATE_NEW_SELECT_VALUE = '__create_new__'

interface ResidentSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  residents: Array<{ id: number; full_name: string; resident_type: string }>
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  onCreateNew?: () => void
  createLabel?: string
}

export function ResidentSelect({
  id,
  value,
  onChange,
  residents,
  placeholder = 'Pilih penghuni...',
  disabled = false,
  invalid = false,
  onCreateNew,
  createLabel = 'Tambah penghuni baru',
}: ResidentSelectProps) {
  const items = residents.map((resident) => ({
    value: String(resident.id),
    label: `${resident.full_name}${
      resident.resident_type === 'permanent' ? ' (Tetap)' : ' (Kontrak)'
    }`,
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
