import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CourseCompletionForm } from '../../services/forms/courseCompletionFormService'

export default Factory.define<CourseCompletionForm>(() => ({
  type: 'CREDIT_TIME',
  crn: faker.string.alphanumeric(6),
  deliusEventNumber: faker.number.int(5),
  appointmentIdToUpdate: faker.number.int(),
  'date-day': faker.number.int({ min: 1, max: 28 }).toString().padStart(2, '0'),
  'date-month': faker.number.int({ min: 1, max: 12 }).toString().padStart(2, '0'),
  'date-year': faker.date.recent().getFullYear().toString(),
  timeToCredit: { hours: faker.number.int(4).toString(), minutes: faker.number.int(59).toString() },
  contactOutcomeCode: faker.string.alpha(8),
  project: faker.string.alpha(8),
  team: faker.string.alpha(8),
  notes: faker.string.alpha(50),
  alertActive: faker.datatype.boolean(),
  sensitive: faker.datatype.boolean(),
}))
