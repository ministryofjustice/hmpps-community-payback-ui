import { Factory } from 'fishery'
import { faker, fakerEN_GB as fakerEngb } from '@faker-js/faker'
import { CommunityCampusPduDto } from '../../@types/shared'

export default Factory.define<CommunityCampusPduDto>(() => ({
  id: faker.string.uuid(),
  name: fakerEngb.location.county(),
  providerCode: faker.string.alpha(8),
}))
