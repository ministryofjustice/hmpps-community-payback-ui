import { Factory } from 'fishery'
import { PagedModelProjectSummariesDto } from '../../@types/shared'
import projectSummaryFactory from './projectSummaryFactory'

export default Factory.define<PagedModelProjectSummariesDto>(() => ({
  content: [{ projects: projectSummaryFactory.buildList(3) }],
  page: {},
}))
