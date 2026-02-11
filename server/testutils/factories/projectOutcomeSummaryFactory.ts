import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ProjectOutcomeSummaryDto } from '../../@types/shared'
import locationFactory from './locationFactory'

export default Factory.define<ProjectOutcomeSummaryDto>(() => ({
  projectName: faker.company.name(),
  projectCode: faker.string.alpha(10),
  location: locationFactory.build(),
  numberOfAppointmentsOverdue: faker.number.int(100),
  oldestOverdueAppointmentInDays: faker.number.int(1000),
}))
