import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { EnforcementDto } from '../../@types/shared'

export default Factory.define<EnforcementDto>(() => ({
  enforcementActionId: faker.string.uuid(),
  respondBy: faker.date.soon().toISOString().split('T')[0],
  enforcementActionName: 'Refer to offender manager',
}))
