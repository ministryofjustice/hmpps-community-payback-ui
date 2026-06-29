import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import attendanceDataFactory from './attendanceDataFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import { contactOutcomeFactory } from './contactOutcomeFactory'
import supervisorSummaryFactory from './supervisorSummaryFactory'

const selectedAppointmentFactory = Factory.define<{ id: number; deliusVersion: string }>(() => ({
  id: faker.number.int(),
  deliusVersion: faker.string.alpha(8),
}))

export default Factory.define<AppointmentOutcomeForm>(
  () =>
    ({
      startTime: '09:00',
      endTime: '17:00',
      contactOutcome: contactOutcomeFactory.build(),
      attendanceData: attendanceDataFactory.build(),
      supervisor: supervisorSummaryFactory.build(),
      notes: undefined,
      isSensitive: 'yes',
      originalSearch: {
        provider: faker.string.alpha(8),
        team: faker.string.alpha(8),
      },
      appointments: selectedAppointmentFactory.buildList(1),
    }) satisfies AppointmentOutcomeForm,
)
