import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { SupervisorSummaryDto } from '../../@types/shared'

export default Factory.define<SupervisorSummaryDto>(() => ({
  id: faker.number.int(),
  name: faker.person.fullName(),
}))
