import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { UnpaidWorkDetailsDto } from '../../@types/shared'
import courtFactory from './courtFactory'
import mainOfficeFactory from './mainOffenceFactory'

export default Factory.define<UnpaidWorkDetailsDto>(() => ({
  eventNumber: faker.number.int(),
  sentenceDate: faker.date.recent().toISOString(),
  requiredMinutes: faker.number.int(),
  completedMinutes: faker.number.int(),
  adjustments: faker.number.int(),
  allowedEteMinutes: faker.number.int(),
  completedEteMinutes: faker.number.int(),
  remainingEteMinutes: faker.number.int(),
  eventOutcome: faker.string.alpha(6),
  upwStatus: faker.string.alpha(10),
  referralDate: faker.date.recent().toISOString(),
  convictionDate: faker.date.recent().toISOString(),
  court: courtFactory.build(),
  mainOffence: mainOfficeFactory.build(),
}))
