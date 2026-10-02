import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CreatedAppointmentDto } from '../../@types/shared'

export default Factory.define<CreatedAppointmentDto>(() => ({
  deliusId: faker.number.int(),
  id: faker.string.alpha(8),
}))
