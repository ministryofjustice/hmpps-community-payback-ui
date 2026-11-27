import { Factory } from 'fishery'
import { IncentivesSchemeMetadata } from '../../@types/shared'

export default Factory.define<IncentivesSchemeMetadata>(() => ({
  qualifyingThresholdPercentage: '25%',
  discountPercentage: '50%',
  maximumDiscountPercentage: '25%',
}))
