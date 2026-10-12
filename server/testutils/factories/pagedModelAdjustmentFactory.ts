import { Factory } from 'fishery'
import { PagedModelAdjustmentDto } from '../../@types/shared'
import adjustmentFactory from './adjustmentFactory'

export default Factory.define<PagedModelAdjustmentDto>(() => ({
  content: adjustmentFactory.buildList(2),
  page: {
    number: 0,
  },
}))
