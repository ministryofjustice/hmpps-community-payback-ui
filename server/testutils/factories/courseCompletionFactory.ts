import { Factory } from 'fishery'
import { faker, fakerEN_GB as fakerEngb } from '@faker-js/faker'
import { EteCourseCompletionEventDto } from '../../@types/shared'
import communityCampusPduFactory from './communityCampusPduFactory'

export default Factory.define<EteCourseCompletionEventDto>(() => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  dateOfBirth: faker.date.birthdate().toDateString(),
  region: fakerEngb.location.county(),
  office: faker.company.name(),
  email: faker.internet.email(),
  courseName: faker.company.buzzNoun(),
  courseType: faker.company.buzzPhrase(),
  provider: faker.company.name(),
  completionDate: faker.date.recent().toISOString(),
  status: 'Passed',
  totalTimeMinutes: faker.number.int({ min: 100, max: 200 }),
  expectedTimeMinutes: faker.number.int({ min: 100, max: 200 }),
  attempts: faker.number.int({ min: 1, max: 3 }),
  externalReference: faker.string.alphanumeric(),
  importedOn: faker.date.recent().toISOString(),
  resolved: faker.datatype.boolean(),
  pdu: communityCampusPduFactory.build(),
}))
