import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CourseCompletionForm } from '../../services/forms/courseCompletionFormService'

export default Factory.define<CourseCompletionForm>(() => ({
  type: 'CREDIT_TIME',
  crn: faker.string.alphanumeric(6),
  deliusEventNumber: faker.number.int(5),
  appointmentIdToUpdate: faker.number.int(),
  date: faker.date.recent().toISOString(),
  minutesToCredit: faker.number.int(200),
  contactOutcomeCode: faker.string.alpha(8),
  project: faker.string.alpha(8),
  team: faker.string.alpha(8),
  notes: faker.string.alpha(50),
  alertActive: faker.datatype.boolean(),
  sensitive: faker.datatype.boolean(),
}))
