import { Factory } from 'fishery'
import { PagedModelAdjustmentDto } from '../../@types/shared'
import adjustmentFactory from './adjustmentFactory'
import pagedMetadataFactory from './pagedMetadataFactory'

export default Factory.define<PagedModelAdjustmentDto>(() => ({
  content: adjustmentFactory.buildList(2),
  page: pagedMetadataFactory.build({ number: 0 }),
}))
