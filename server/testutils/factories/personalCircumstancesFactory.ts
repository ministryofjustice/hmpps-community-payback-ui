import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { PersonalCircumstancesDto } from '../../@types/shared'
import personalCircumstancesCodeFactory from './personalCircumstancesCodeFactory'

export default Factory.define<PersonalCircumstancesDto>(() => ({
  type: personalCircumstancesCodeFactory.build(),
  subType: personalCircumstancesCodeFactory.build(),
  startDate: faker.date.recent().toISOString(),
  endDate: faker.date.recent().toISOString(),
  verified: faker.datatype.boolean(),
  notes: faker.string.alpha(30),
}))
