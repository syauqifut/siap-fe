import { Link, useParams } from 'react-router-dom'
import { PencilIcon } from 'lucide-react'

import { OccupancyHistorySection } from '@/components/occupancy/OccupancyHistorySection'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useResident } from '@/hooks/useResidents'
import { getApiErrorMessage } from '@/lib/utils'

const GENDER_LABELS: Record<string, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
}

export default function ResidentDetail() {
  const { id } = useParams()
  const { data: resident, isLoading, error } = useResident(id)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />
  if (!resident) return <EmptyState text="Data penghuni tidak ditemukan" />

  return (
    <div className="space-y-4">
      <PageHeader
        title={resident.full_name}
        description="Detail penghuni, hunian saat ini, dan riwayat kepenghunian."
        breadcrumbs={[{ label: 'Penghuni', to: '/residents' }]}
        backTo="/residents"
      />

      <Card>
        <CardHeader>
          <CardTitle>Informasi Penghuni</CardTitle>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              render={<Link to={`/residents/${resident.id}/edit`} />}
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nama Lengkap</dt>
              <dd className="font-medium">{resident.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Jenis Kelamin</dt>
              <dd>
                {GENDER_LABELS[resident.gender] ?? resident.gender}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Tipe Penghuni</dt>
              <dd className="mt-0.5">
                <StatusBadge
                  label={
                    resident.resident_type === 'permanent' ? 'Tetap' : 'Kontrak'
                  }
                  variant={
                    resident.resident_type === 'permanent'
                      ? 'positive'
                      : 'neutral'
                  }
                />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">No. Telepon</dt>
              <dd>{resident.phone_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status Nikah</dt>
              <dd>{resident.is_married ? 'Menikah' : 'Belum menikah'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Foto KTP</dt>
              <dd className="mt-2">
                {resident.id_card_photo_url ? (
                  <img
                    src={resident.id_card_photo_url}
                    alt={`Foto KTP ${resident.full_name}`}
                    className="max-h-48 rounded-lg border"
                  />
                ) : (
                  <span className="text-muted-foreground">Belum ada foto</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hunian Saat Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {resident.current_house ? (
            <dl>
              <dt className="text-sm text-muted-foreground">Nomor Rumah</dt>
              <dd className="font-medium">
                <Link
                  to={`/houses/${resident.current_house.id}`}
                  className="text-primary hover:underline"
                >
                  {resident.current_house.house_number}
                </Link>
              </dd>
            </dl>
          ) : (
            <EmptyState text="Penghuni ini tidak sedang menghuni rumah manapun" />
          )}
        </CardContent>
      </Card>

      <OccupancyHistorySection residentId={resident.id} />
    </div>
  )
}
