import { Link, useParams } from 'react-router-dom'
import { PencilIcon } from 'lucide-react'

import { ActiveResidentsSection } from '@/components/occupancy/ActiveResidentsSection'
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
import { useHouse } from '@/hooks/useHouses'
import { getApiErrorMessage } from '@/lib/utils'

export default function HouseDetail() {
  const { id } = useParams()
  const { data: house, isLoading, error } = useHouse(id)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />
  if (!house) return <EmptyState text="Data rumah tidak ditemukan" />

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Rumah ${house.house_number}`}
        description="Detail rumah, penghuni aktif, dan riwayat kepenghunian."
        breadcrumbs={[
          { label: 'Rumah', to: '/houses' },
        ]}
        backTo="/houses"
      />

      <Card>
        <CardHeader>
          <CardTitle>Informasi Rumah</CardTitle>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              render={<Link to={`/houses/${house.id}/edit`} />}
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nomor Rumah</dt>
              <dd className="font-medium">{house.house_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="mt-0.5">
                <StatusBadge
                  label={house.is_occupied ? 'Dihuni' : 'Kosong'}
                  variant={house.is_occupied ? 'positive' : 'neutral'}
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <ActiveResidentsSection house={house} />

      <OccupancyHistorySection houseId={house.id} />
    </div>
  )
}
