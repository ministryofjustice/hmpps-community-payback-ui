import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CreateAppointmentDto } from '../../@types/shared'

export default Factory.define<CreateAppointmentDto>(
  () =>
    ({
      crn: faker.string.alphanumeric(7),
      deliusEventNumber: faker.number.int({ min: 1, max: 1000 }),
      projectCode: faker.string.alpha(8),
      date: faker.date.recent().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '10:00',
    }) satisfies CreateAppointmentDto,
)
