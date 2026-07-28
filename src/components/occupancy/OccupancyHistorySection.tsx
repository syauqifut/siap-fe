import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOccupancyHistoryList } from '@/hooks/useOccupancy'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import type { OccupancyEventType } from '@/types/occupancy'

const EVENT_TYPE_OPTIONS: Array<{
  label: string
  value: OccupancyEventType | undefined
}> = [
  { label: 'Semua', value: undefined },
  { label: 'Masuk', value: 'check_in' },
  { label: 'Keluar', value: 'check_out' },
]

const EVENT_TYPE_LABELS: Record<OccupancyEventType, string> = {
  check_in: 'Masuk',
  check_out: 'Keluar',
}

type OccupancyHistorySectionProps =
  | { houseId: number; residentId?: never }
  | { residentId: number; houseId?: never }

export function OccupancyHistorySection({
  houseId,
  residentId,
}: OccupancyHistorySectionProps) {
  const [page, setPage] = useState(1)
  const [eventType, setEventType] = useState<OccupancyEventType | undefined>()
  const isHouseView = houseId !== undefined

  const { data, isLoading, error } = useOccupancyHistoryList({
    house_id: houseId,
    resident_id: residentId,
    event_type: eventType,
    page,
  })

  const histories = data?.data ?? []
  const meta = data?.meta

  const handleEventTypeChange = (value: OccupancyEventType | undefined) => {
    setEventType(value)
    setPage(1)
  }

  const emptyText = isHouseView
    ? 'Belum ada riwayat kepenghunian untuk rumah ini'
    : 'Belum ada riwayat kepenghunian untuk penghuni ini'

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle>Riwayat Kepenghunian</CardTitle>
        <div className="flex gap-1">
          {EVENT_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={eventType === option.value ? 'default' : 'outline'}
              onClick={() => handleEventTypeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={getApiErrorMessage(error)} />
        ) : histories.length === 0 ? (
          <EmptyState text={emptyText} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>{isHouseView ? 'Penghuni' : 'Rumah'}</TableHead>
                  <TableHead>Kejadian</TableHead>
                  <TableHead>Dicatat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{formatDate(history.event_date)}</TableCell>
                    <TableCell className="font-medium">
                      {isHouseView ? (
                        history.resident.full_name
                      ) : (
                        <Link
                          to={`/houses/${history.house.id}`}
                          className="text-primary hover:underline"
                        >
                          {history.house.house_number}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={EVENT_TYPE_LABELS[history.event_type]}
                        variant={
                          history.event_type === 'check_in'
                            ? 'positive'
                            : 'negative'
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(history.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta && meta.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Halaman {meta.current_page} dari {meta.last_page} · {meta.total}{' '}
                  riwayat
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
