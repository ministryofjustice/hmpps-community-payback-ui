import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { PersonalCircumstancesCodeDto } from '../../@types/shared'

export default Factory.define<PersonalCircumstancesCodeDto>(() => ({
  code: faker.string.alpha(30),
  description: faker.string.alpha(30),
}))
