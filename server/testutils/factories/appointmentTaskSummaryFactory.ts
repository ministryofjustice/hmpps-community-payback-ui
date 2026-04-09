import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppointmentTaskSummaryDto } from '../../@types/shared'
import appointmentSummaryFactory from './appointmentSummaryFactory'

export default Factory.define<AppointmentTaskSummaryDto>(() => ({
  taskId: faker.string.alphanumeric(),
  appointment: appointmentSummaryFactory.build(),
}))
