import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppointmentTaskSummaryDto } from '../../@types/shared'
import offenderFullFactory from './offenderFullFactory'

export default Factory.define<AppointmentTaskSummaryDto>(() => ({
  taskId: faker.string.alphanumeric(),
  deliusAppointmentId: faker.number.int(),
  projectCode: faker.string.alphanumeric(),
  offender: offenderFullFactory.build(),
  date: faker.date.recent().toISOString(),
  projectTypeName: faker.commerce.productName(),
}))
