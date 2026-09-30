import { PlacementType } from '../fixtures/testOptions'

const projectTypesByPlacementType: Partial<Record<PlacementType, string>> = {
  individual: 'Individual Placement - ICP (Individual Community Placement)',
  ete: 'ETE - HMPPS Portal',
  induction: 'UPW PoP Induction',
  otherEte: 'ETE- Contracted Provider',
}

export default function getProjectType(placementType: PlacementType): {
  projectType?: string
} {
  return { projectType: projectTypesByPlacementType[placementType] }
}
