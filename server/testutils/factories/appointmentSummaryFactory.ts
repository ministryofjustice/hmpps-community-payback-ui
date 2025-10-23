import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppointmentSummaryDto } from '../../@types/shared'
import offenderFullFactory from './offenderFullFactory'

export default Factory.define<AppointmentSummaryDto>(() => ({
  id: faker.number.int(),
  requirementMinutes: faker.number.int(1000),
  completedMinutes: faker.number.int(1000),
  offender: offenderFullFactory.build(),
}))
