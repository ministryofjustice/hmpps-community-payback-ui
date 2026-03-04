import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ProjectAvailabilityDto } from '../../@types/shared'

export default Factory.define<ProjectAvailabilityDto>(() => ({
  frequency: faker.helpers.arrayElement(['ONCE', 'WEEKLY', 'FORTNIGHTLY']),
  dayOfWeek: faker.helpers.arrayElement(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startDateInclusive: faker.date.past({ years: 2 }).toISOString(),
  endDateExclusive: faker.date.future({ years: 2 }).toISOString(),
}))
