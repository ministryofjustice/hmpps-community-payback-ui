import { Factory } from 'fishery'
import { PagedModelEteCourseCompletionEventDto } from '../../@types/shared'
import courseCompletionFactory from './courseCompletionFactory'
import pagedMetadataFactory from './pagedMetadataFactory'

export default Factory.define<PagedModelEteCourseCompletionEventDto>(() => ({
  content: courseCompletionFactory.buildList(2),
  page: pagedMetadataFactory.build(),
}))
