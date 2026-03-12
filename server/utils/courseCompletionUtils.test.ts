import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import CourseCompletionUtils from './courseCompletionUtils'
import DateTimeFormats from './dateTimeUtils'

describe('CourseCompletionUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('formattedLearnerDetails', () => {
    it('returns formatted learner details', () => {
      const dateOfBirth = '12 January 1990'
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(dateOfBirth)
      const courseCompletion = courseCompletionFactory.build()

      const result = CourseCompletionUtils.formattedLearnerDetails(courseCompletion)
      expect(result).toEqual({
        firstName: courseCompletion.firstName,
        lastName: courseCompletion.lastName,
        dateOfBirth,
        email: courseCompletion.email,
        region: courseCompletion.region,
        pdu: courseCompletion.pdu.name,
        office: courseCompletion.office,
      })
    })
  })
})
