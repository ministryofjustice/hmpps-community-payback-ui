import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { PersonalCircumstancesDetailsDto } from '../../@types/shared'

export default Factory.define<PersonalCircumstancesDetailsDto>(() => ({
  startDate: faker.date.recent().toISOString(),
  endDate: faker.date.recent().toISOString(),
  verified: faker.datatype.boolean(),
  notes: faker.string.alpha(30),
}))
