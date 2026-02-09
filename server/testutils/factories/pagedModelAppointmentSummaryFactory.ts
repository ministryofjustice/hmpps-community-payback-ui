import { Factory } from 'fishery'
import { PagedModelAppointmentSummaryDto } from '../../@types/shared'
import appointmentSummaryFactory from './appointmentSummaryFactory'

export default Factory.define<PagedModelAppointmentSummaryDto>(() => ({
  content: appointmentSummaryFactory.buildList(2),
  page: {},
}))
