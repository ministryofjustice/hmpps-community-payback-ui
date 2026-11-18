import { Factory } from 'fishery'
import { PagedModelSessionSummaryDto } from '../../@types/shared'
import sessionSummaryFactory from './sessionSummaryFactory'
import pagedMetadataFactory from './pagedMetadataFactory'

export default Factory.define<PagedModelSessionSummaryDto>(() => ({
  content: sessionSummaryFactory.buildList(2),
  page: pagedMetadataFactory.build({ number: 0 }),
}))
