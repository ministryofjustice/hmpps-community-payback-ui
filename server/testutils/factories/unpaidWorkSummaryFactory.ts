import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { UnpaidWorkDetailsDto } from '../../@types/shared'

export default Factory.define<UnpaidWorkDetailsDto>(() => ({
  eventNumber: faker.number.int(),
  sentenceDate: faker.date.recent().toISOString(),
  requiredMinutes: faker.number.int(1000),
  completedMinutes: faker.number.int(500),
  adjustments: faker.number.int(250),
  completedEteMinutes: faker.number.int(250),
}))
