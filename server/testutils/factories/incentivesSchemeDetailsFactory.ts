import { Factory } from 'fishery'
import { IncentivesSchemeDetails } from '../../@types/shared'

export default Factory.define<IncentivesSchemeDetails>(() => ({
  currentDiscount: 'P3D',
  projectedDiscount: 'P3D',
  qualifyingThreshold: 'P3D',
  qualifyingTimeWorked: 'P3D',
  status: 'INELIGIBLE',
  totalRequirement: 'P3D',
  totalTimeWorked: 'P3D',
}))
