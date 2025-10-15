import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { SupervisorSummaryDto } from '../../@types/shared'

export default Factory.define<SupervisorSummaryDto>(() => ({
  code: faker.string.alpha(8),
  name: faker.person.fullName(),
}))
