import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CreateAppointmentForm } from '../../services/forms/appointmentFormService'
import providerTeamSummaryFactory from './providerTeamSummaryFactory'
import supervisorSummaryFactory from './supervisorSummaryFactory'

export default Factory.define<CreateAppointmentForm>(
  () =>
    ({
      startTime: '09:00',
      endTime: '17:00',
      crn: `CRN${faker.string.alphanumeric({ length: 5 })}`,
      deliusEventNumber: faker.number.int({ min: 1, max: 1000 }).toString(),
      notes: undefined,
      isSensitive: undefined,
      originalSearch: {
        provider: faker.string.alpha(8),
        team: faker.string.alpha(8),
        date: '01/01/2025',
      },
      supervisor: supervisorSummaryFactory.build(),
      projectTeam: providerTeamSummaryFactory.build(),
      project: { code: faker.string.alphanumeric(8), name: faker.company.name() },
      date: faker.date.past().toISOString().split('T')[0],
      provider: { code: faker.string.alphanumeric(8), name: faker.company.name() },
      projectTypeGroup: 'GROUP',
    }) satisfies CreateAppointmentForm,
)
