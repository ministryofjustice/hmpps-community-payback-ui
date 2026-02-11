import { Factory } from 'fishery'
import { PagedModelProjectOutcomeSummaryDto } from '../../@types/shared'
import projectOutcomeSummaryFactory from './projectOutcomeSummaryFactory'

export default Factory.define<PagedModelProjectOutcomeSummaryDto>(() => ({
  content: projectOutcomeSummaryFactory.buildList(3),
  page: {},
}))
