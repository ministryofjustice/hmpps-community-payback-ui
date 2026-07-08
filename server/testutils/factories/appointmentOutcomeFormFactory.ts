import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import attendanceDataFactory from './attendanceDataFactory'
import {
  AppointmentOutcomeForm,
  UpdateAppointmentForm,
  UpdateSessionForm,
} from '../../services/forms/appointmentFormService'
import { contactOutcomeFactory } from './contactOutcomeFactory'
import supervisorSummaryFactory from './supervisorSummaryFactory'
import providerTeamSummaryFactory from './providerTeamSummaryFactory'

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
      projectTeam: providerTeamSummaryFactory.build(),
      project: { code: faker.string.alphanumeric(8), name: faker.company.name() },
    }) satisfies AppointmentOutcomeForm,
)

export const updateAppointmentFormFactory = Factory.define<UpdateAppointmentForm>(() => ({
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
  deliusVersion: faker.string.alpha(8),
  projectTeam: providerTeamSummaryFactory.build(),
  project: { code: faker.string.alphanumeric(8), name: faker.company.name() },
}))

export const updateSessionFormFactory = Factory.define<UpdateSessionForm>(() => ({
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
  projectTeam: providerTeamSummaryFactory.build(),
  project: { code: faker.string.alphanumeric(8), name: faker.company.name() },
}))
