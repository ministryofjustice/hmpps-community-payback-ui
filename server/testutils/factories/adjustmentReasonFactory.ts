import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AdjustmentReasonDto } from '../../@types/shared'

export default Factory.define<AdjustmentReasonDto>(() => ({
  id: faker.string.alpha(8),
  name: faker.word.verb(),
  maxMinutesAllowed: faker.number.int(),
  deliusCode: faker.string.alpha(8),
}))
