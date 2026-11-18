import { Factory } from 'fishery'
import { PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import appointmentTaskSummaryFactory from './appointmentTaskSummaryFactory'
import pagedMetadataFactory from './pagedMetadataFactory'

export default Factory.define<PagedModelAppointmentTaskSummaryDto>(() => ({
  content: appointmentTaskSummaryFactory.buildList(2),
  page: pagedMetadataFactory.build(),
}))
