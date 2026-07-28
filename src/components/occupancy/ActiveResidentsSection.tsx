import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRightIcon, LogOutIcon, PlusIcon } from 'lucide-react'

import { CheckInDialog } from '@/components/occupancy/CheckInDialog'
import { CheckOutDialog } from '@/components/occupancy/CheckOutDialog'
import { ReplaceResidentDialog } from '@/components/occupancy/ReplaceResidentDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
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
import { useResidentList } from '@/hooks/useResidents'
import { formatDate } from '@/lib/utils'
import type { House, HouseOccupant } from '@/types/house'

const GENDER_LABELS: Record<string, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
}

interface ActiveResidentsSectionProps {
  house: House
}

export function ActiveResidentsSection({ house }: ActiveResidentsSectionProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [checkOutTarget, setCheckOutTarget] = useState<HouseOccupant | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<HouseOccupant | null>(null)

  const { data: residentsData, isLoading: isResidentsLoading } = useResidentList({
    per_page: 100,
  })

  const residents = residentsData?.data ?? []

  const handleCheckOutDialogChange = (open: boolean) => {
    if (!open) setCheckOutTarget(null)
  }

  const handleReplaceDialogChange = (open: boolean) => {
    if (!open) setReplaceTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Penghuni Aktif</CardTitle>
          <CardAction>
            <Button size="sm" onClick={() => setIsCheckInOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Tambah Penghuni
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {house.current_residents.length === 0 ? (
            <div className="space-y-3">
              <EmptyState text="Rumah ini sedang kosong" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Menghuni Sejak</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {house.current_residents.map((occupant) => (
                  <TableRow key={occupant.resident.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/residents/${occupant.resident.id}`}
                        className="text-primary hover:underline"
                      >
                        {occupant.resident.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {GENDER_LABELS[occupant.resident.gender] ??
                        occupant.resident.gender}
                    </TableCell>
                    <TableCell>{formatDate(occupant.occupied_since)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplaceTarget(occupant)}
                        >
                          <ArrowLeftRightIcon data-icon="inline-start" />
                          Ganti
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCheckOutTarget(occupant)}
                        >
                          <LogOutIcon data-icon="inline-start" />
                          Keluarkan
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CheckInDialog
        open={isCheckInOpen}
        onOpenChange={setIsCheckInOpen}
        house={house}
        residents={residents}
        isResidentsLoading={isResidentsLoading}
      />

      <CheckOutDialog
        open={Boolean(checkOutTarget)}
        onOpenChange={handleCheckOutDialogChange}
        houseId={house.id}
        houseNumber={house.house_number}
        occupant={checkOutTarget}
      />

      <ReplaceResidentDialog
        open={Boolean(replaceTarget)}
        onOpenChange={handleReplaceDialogChange}
        house={house}
        occupant={replaceTarget}
        residents={residents}
        isResidentsLoading={isResidentsLoading}
      />
    </>
  )
}
