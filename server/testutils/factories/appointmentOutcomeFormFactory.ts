import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import attendanceDataFactory from './attendanceDataFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import { contactOutcomeFactory } from './contactOutcomeFactory'
import supervisorSummaryFactory from './supervisorSummaryFactory'

export default Factory.define<AppointmentOutcomeForm>(
  () =>
    ({
      startTime: '09:00',
      endTime: '17:00',
      contactOutcome: contactOutcomeFactory.build(),
      attendanceData: attendanceDataFactory.build(),
      supervisor: supervisorSummaryFactory.build(),
      notes: faker.string.alpha(30),
    }) satisfies AppointmentOutcomeForm,
)
