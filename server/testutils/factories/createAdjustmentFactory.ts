import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CreateAdjustmentDto } from '../../@types/shared'

export default Factory.define<CreateAdjustmentDto>(() => ({
  taskId: faker.string.alpha(10),
  type: 'Positive',
  minutes: faker.number.int(),
  dateOfAdjustment: faker.date.recent().toISOString().split('T')[0],
  adjustmentReasonId: faker.string.alpha(10),
}))
