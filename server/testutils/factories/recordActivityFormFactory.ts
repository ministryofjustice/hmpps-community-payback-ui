import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import attendanceDataFactory from './attendanceDataFactory'
import { contactOutcomeFactory } from './contactOutcomeFactory'
import providerTeamSummaryFactory from './providerTeamSummaryFactory'
import { RecordActivityForm } from '../../services/forms/recordActivityFormService'

export default Factory.define<RecordActivityForm>(
  () =>
    ({
      crn: faker.string.alphanumeric(8),
      deliusEventNumber: faker.number.int(5).toString(),
      projectTypeGroup: 'OTHER_ETE',
      provider: { code: faker.string.alphanumeric(8), name: faker.company.name() },
      projectTeam: providerTeamSummaryFactory.build(),
      project: { code: faker.string.alphanumeric(8), name: faker.company.name() },
      date: faker.date.recent().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      contactOutcome: contactOutcomeFactory.build(),
      attendanceData: attendanceDataFactory.build(),
      notes: undefined,
      isSensitive: 'yes',
      originalSearch: {
        provider: faker.string.alpha(8),
        team: faker.string.alpha(8),
      },
      originalPath: '/people/create/education-training-employment',
    }) satisfies RecordActivityForm,
)
