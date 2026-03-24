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
  describe('formattedCourseDetails', () => {
    it('returns formatted course details', () => {
      const expectedTime = '2 hours 30 minutes'
      const expectedTimeWithAllowance = '3 hours 0 minutes'
      jest
        .spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes')
        .mockImplementation((minutes: number) => {
          if (minutes === 150) return expectedTime
          if (minutes === 180) return expectedTimeWithAllowance
          return '0 hours 0 minutes'
        })
      const courseCompletion = courseCompletionFactory.build({ expectedTimeMinutes: 150 })

      const result = CourseCompletionUtils.formattedCourseDetails(courseCompletion)
      expect(result).toEqual({
        courseName: courseCompletion.courseName,
        courseType: courseCompletion.courseType,
        provider: courseCompletion.provider,
        expectedTime,
        expectedTimeWithAllowance,
      })
      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(150)
      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(180)
    })
  })
})
