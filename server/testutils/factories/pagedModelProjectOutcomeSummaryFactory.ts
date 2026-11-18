import { Factory } from 'fishery'
import { PagedModelProjectOutcomeSummaryDto } from '../../@types/shared'
import projectOutcomeSummaryFactory from './projectOutcomeSummaryFactory'
import pagedMetadataFactory from './pagedMetadataFactory'

export default Factory.define<PagedModelProjectOutcomeSummaryDto>(() => ({
  content: projectOutcomeSummaryFactory.buildList(3),
  page: pagedMetadataFactory.build(),
}))
