import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import offenderFullFactory from './offenderFullFactory'
import { OffenderFullDto, OffenderLimitedDto, OffenderNotFoundDto } from '../../@types/shared'

export type ProjectAppointmentSummaryDto = {
  id: number
  offender: OffenderFullDto | OffenderLimitedDto | OffenderNotFoundDto
  date: string
  startTime: string
  endTime: string
  daysOverdue: number
}

export default Factory.define<ProjectAppointmentSummaryDto>(() => ({
  id: faker.number.int(),
  startTime: faker.helpers.arrayElement(['09:00', '10:00', '11:00']),
  endTime: faker.helpers.arrayElement(['14:00', '15:00', '16:00']),
  offender: offenderFullFactory.build(),
  date: faker.date.past({ years: 1 }).toISOString(),
  daysOverdue: faker.number.int({ max: 10 }),
}))
