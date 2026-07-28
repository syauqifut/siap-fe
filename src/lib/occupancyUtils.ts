import type { HouseOccupant } from '@/types/house'
import type { Resident, ResidentType } from '@/types/resident'

function getReferenceResidentType(
  residents: Resident[],
  occupants: HouseOccupant[],
): ResidentType | undefined {
  const referenceOccupant = occupants[0]
  if (!referenceOccupant) return undefined

  return residents.find(
    (resident) => resident.id === referenceOccupant.resident.id,
  )?.resident_type
}

export function getEligibleResidentsForCheckIn(
  residents: Resident[],
  currentOccupants: HouseOccupant[],
): Resident[] {
  const referenceType = getReferenceResidentType(residents, currentOccupants)

  return residents.filter((resident) => {
    if (resident.current_house) return false
    if (referenceType && resident.resident_type !== referenceType) return false

    return true
  })
}

export function getEligibleResidentsForReplace(
  residents: Resident[],
  currentOccupants: HouseOccupant[],
  oldResidentId: number,
): Resident[] {
  const remainingOccupants = currentOccupants.filter(
    (occupant) => occupant.resident.id !== oldResidentId,
  )

  return getEligibleResidentsForCheckIn(residents, remainingOccupants)
}
