import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { NameDto } from '../../@types/shared'

export default Factory.define<NameDto>(() => ({
  forename: faker.person.firstName(),
  surname: faker.person.lastName(),
  middleNames: [faker.person.middleName(), faker.person.middleName()],
}))
