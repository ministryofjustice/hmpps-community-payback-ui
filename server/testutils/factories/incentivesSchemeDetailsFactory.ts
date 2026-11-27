import { Factory } from 'fishery'
import { IncentivesSchemeDetails } from '../../@types/shared'

export default Factory.define<IncentivesSchemeDetails>(() => ({
  currentDiscount: 'PT72H',
  projectedDiscount: 'PT72H',
  qualifyingThreshold: 'PT72H',
  qualifyingTimeWorked: 'PT72H',
  status: 'INELIGIBLE',
  totalRequirement: 'PT72H',
  totalTimeWorked: 'PT72H',
}))
