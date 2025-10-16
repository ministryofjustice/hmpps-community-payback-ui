import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppointmentDto } from '../../@types/shared'
import offenderFullFactory from './offenderFullFactory'

export default Factory.define<AppointmentDto>(() => ({
  id: faker.number.int(),
  projectCode: faker.string.alpha(10),
  projectId: faker.number.int(),
  projectName: faker.company.name(),
  projectTypeName: faker.company.buzzPhrase(),
  projectTypeCode: faker.string.alpha(10),
  offender: offenderFullFactory.build(),
  supervisingTeam: faker.location.county(),
  date: faker.date.recent().toISOString(),
  startTime: '09:00',
  endTime: '17:00',
  providerCode: faker.string.alpha(10),
  supervisingTeamCode: faker.string.alpha(10),
}))
