import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import offenderLimitedFactory from '../testutils/factories/offenderLimitedFactory'
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
      const totalTimeSpent = '1 hour 40 minutes'
      const expectedTime = '2 hours 30 minutes'
      const expectedTimeWithAllowance = '3 hours 0 minutes'
      jest
        .spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes')
        .mockImplementation((minutes: number) => {
          if (minutes === 100) return totalTimeSpent
          if (minutes === 150) return expectedTime
          if (minutes === 180) return expectedTimeWithAllowance
          return '0 hours 0 minutes'
        })
      const courseCompletion = courseCompletionFactory.build({ expectedTimeMinutes: 150, totalTimeMinutes: 100 })

      const result = CourseCompletionUtils.formattedCourseDetails(courseCompletion)
      expect(result).toEqual({
        courseName: courseCompletion.courseName,
        courseType: courseCompletion.courseType,
        provider: courseCompletion.provider,
        expectedTime,
        expectedTimeWithAllowance,
        totalTimeSpent,
      })
      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(100)

      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(150)
      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(180)
    })
  })
  describe('formattedOffenderDetails', () => {
    describe('when the offender is limited', () => {
      it('returns limited formatted offender details', () => {
        const offender = offenderLimitedFactory.build()
        const result = CourseCompletionUtils.formattedOffenderDetails(offender)
        expect(result).toEqual({
          crn: offender.crn,
          isLimited: true,
        })
      })
    })

    describe('when the offender is not limited', () => {
      it('returns full formatted offender details', () => {
        const dateOfBirth = '10 March 1980'
        jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(dateOfBirth)

        const offender = offenderFullFactory.build()
        const result = CourseCompletionUtils.formattedOffenderDetails(offender)

        expect(result).toEqual({
          crn: offender.crn,
          isLimited: false,
          firstName: offender.forename,
          lastName: offender.surname,
          dateOfBirth,
        })
      })
    })
  })
})
