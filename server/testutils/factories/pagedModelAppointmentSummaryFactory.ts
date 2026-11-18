import { Factory } from 'fishery'
import { PagedModelAppointmentSummaryDto } from '../../@types/shared'
import appointmentSummaryFactory from './appointmentSummaryFactory'
import pagedMetadataFactory from './pagedMetadataFactory'

export default Factory.define<PagedModelAppointmentSummaryDto>(() => ({
  content: appointmentSummaryFactory.buildList(2),
  page: pagedMetadataFactory.build({ number: 0 }),
}))
