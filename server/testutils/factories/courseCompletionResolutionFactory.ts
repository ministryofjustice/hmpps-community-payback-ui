import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CourseCompletionResolutionDto } from '../../@types/shared'

export default Factory.define<CourseCompletionResolutionDto>(
  () =>
    ({
      type: faker.helpers.arrayElement(['CREDIT_TIME', 'DONT_CREDIT_TIME']),
      crn: faker.string.alpha(7),
      creditTimeDetails: {
        deliusEventNumber: faker.number.int(),
        appointmentIdToUpdate: faker.number.int(),
        date: faker.date.recent().toISOString().split('T')[0],
        minutesToCredit: faker.number.int({ min: 30, max: 480 }),
        contactOutcomeCode: faker.string.alpha(6),
        projectCode: faker.string.alpha(4),
        notes: faker.string.alpha(30),
        alertActive: faker.datatype.boolean(),
        sensitive: faker.datatype.boolean(),
      },
    }) satisfies CourseCompletionResolutionDto,
)
