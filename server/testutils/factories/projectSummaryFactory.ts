import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { LocationDto } from '../../@types/shared'
import locationFactory from './locationFactory'

export type ProjectSummaryDto = {
  projectName: string
  projectCode: string
  location: LocationDto
  numberOfAppointmentsOverdue: number
  oldestOverdueAppointmentInDays: number
}

export default Factory.define<ProjectSummaryDto>(() => ({
  projectName: faker.company.name(),
  projectCode: faker.string.alpha(10),
  location: locationFactory.build(),
  numberOfAppointmentsOverdue: faker.number.int(100),
  oldestOverdueAppointmentInDays: faker.number.int(1000),
}))
