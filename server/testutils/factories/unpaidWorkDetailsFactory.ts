import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { UnpaidWorkDetailsDto } from '../../@types/shared'
import courtFactory from './courtFactory'
import mainOfficeFactory from './mainOffenceFactory'

export default Factory.define<UnpaidWorkDetailsDto>(() => ({
  eventNumber: faker.number.int({ min: 1 }),
  sentenceDate: faker.date.recent().toISOString(),
  requiredMinutes: faker.number.int({ min: 100, max: 300 }),
  completedMinutes: faker.number.int({ min: 0, max: 100 }),
  adjustments: faker.number.int({ min: 0, max: 100 }),
  allowedEteMinutes: faker.number.int({ min: 100, max: 200 }),
  completedEteMinutes: faker.number.int({ min: 0, max: 100 }),
  remainingEteMinutes: faker.number.int({ min: 0, max: 100 }),
  eventOutcome: faker.string.alpha(6),
  upwStatus: faker.string.alpha(10),
  referralDate: faker.date.recent().toISOString(),
  convictionDate: faker.date.recent().toISOString(),
  court: courtFactory.build(),
  mainOffence: mainOfficeFactory.build(),
}))
