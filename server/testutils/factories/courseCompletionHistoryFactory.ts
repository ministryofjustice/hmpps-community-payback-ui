import { Factory } from 'fishery'
import { EteCourseCompletionEventDto } from '../../@types/shared'
import courseCompletionFactory from './courseCompletionFactory'

export default Factory.define<EteCourseCompletionEventDto[]>(() => courseCompletionFactory.buildList(3))
