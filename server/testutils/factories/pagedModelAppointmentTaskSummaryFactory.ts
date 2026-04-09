import { Factory } from 'fishery'
import { PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import appointmentTaskSummaryFactory from './appointmentTaskSummaryFactory'

export default Factory.define<PagedModelAppointmentTaskSummaryDto>(() => ({
  content: appointmentTaskSummaryFactory.buildList(2),
  page: {},
}))
