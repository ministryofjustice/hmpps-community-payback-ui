import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { UpdateAppointmentOutcomeResultDto } from '../../@types/shared'

export default Factory.define<UpdateAppointmentOutcomeResultDto>(() => ({
  deliusId: faker.number.int({ min: 0 }),
  result: 'SUCCESS',
}))
