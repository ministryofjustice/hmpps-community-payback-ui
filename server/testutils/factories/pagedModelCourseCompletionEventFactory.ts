import { Factory } from 'fishery'
import { PagedModelEteCourseCompletionEventDto } from '../../@types/shared'
import courseCompletionFactory from './courseCompletionFactory'

export default Factory.define<PagedModelEteCourseCompletionEventDto>(() => ({
  content: courseCompletionFactory.buildList(2),
  page: {},
}))
