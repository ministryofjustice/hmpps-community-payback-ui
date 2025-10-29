import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { EnforcementActionDto } from '../../@types/shared'

export default Factory.define<EnforcementActionDto>(() => ({
  id: faker.string.uuid(),
  name: faker.word.verb(),
  code: faker.string.sample(10),
  respondByDateRequired: faker.datatype.boolean(),
}))
