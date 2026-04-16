import { PlacementType } from '../fixtures/testOptions'

export default function getProjectType(placementType: PlacementType): {
  projectType?: string
} {
  if (placementType === 'individual') {
    return { projectType: 'Individual Placement - ICP (Individual Community Placement)' }
  }

  if (placementType === 'ete') {
    return { projectType: 'ETE - HMPPS Portal' }
  }
  return {}
}
