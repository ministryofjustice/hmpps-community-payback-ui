import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import offenderLimitedFactory from '../testutils/factories/offenderLimitedFactory'
import CourseCompletionUtils from './courseCompletionUtils'
import DateTimeFormats from './dateTimeUtils'

describe('CourseCompletionUtils', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
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
      const date = '13 July 2025'
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)
      const courseCompletion = courseCompletionFactory.build({ expectedTimeMinutes: 150, totalTimeMinutes: 100 })

      const result = CourseCompletionUtils.formattedCourseDetails(courseCompletion)
      expect(result).toEqual({
        completionDate: date,
        expectedTime,
        expectedTimeWithAllowance,
        totalTimeSpent,
      })
      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(100)

      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(150)
      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenCalledWith(180)
      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(courseCompletion.completionDateTime)
    })
  })
  describe('formattedOffenderDetails', () => {
    describe('when the offender is limited', () => {
      it('returns limited formatted offender details', () => {
        const offender = offenderLimitedFactory.build()
        const result = CourseCompletionUtils.formattedOffenderDetails(offender)
        expect(result).toEqual({
          crn: offender.crn,
          description: offender.crn,
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
          description: `${offender.forename} ${offender.surname} (${offender.crn})`,
        })
      })
    })
  })

  describe('formattedCourseCompletionLabel', () => {
    it('formats the course completion label appropriately', () => {
      const failedCourseCompletion = courseCompletionFactory.build({ status: 'Failed' })
      expect(CourseCompletionUtils.formattedCourseCompletionLabel(failedCourseCompletion.status)).toEqual('Fail')

      const passedCourseCompletion = courseCompletionFactory.build({ status: 'Passed' })
      expect(CourseCompletionUtils.formattedCourseCompletionLabel(passedCourseCompletion.status)).toEqual('Pass')
    })
  })

  describe('completionDetails', () => {
    it.each([['Failed' as const], ['Passed' as const]])('returns row with completion details for %s', status => {
      const courseCompletion = courseCompletionFactory.build({ status })
      const [row] = CourseCompletionUtils.completionDetailsRows({
        courseCompletion,
        allCourseCompletions: [courseCompletion],
      })

      expect((row.key as { text: string }).text).toEqual(`Attempt ${courseCompletion.attempts}`)
      expect((row.value as { html: string }).html).toContain(
        DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(courseCompletion.totalTimeMinutes),
      )
      expect((row.value as { html: string }).html).toContain(
        DateTimeFormats.isoDateToUIDate(courseCompletion.completionDateTime),
      )
      expect((row.value as { html: string }).html).toContain(
        CourseCompletionUtils.formattedCourseCompletionLabel(courseCompletion.status),
      )
    })

    describe('Passes', () => {
      describe('when all attempts are present', () => {
        it('returns row with attempts in order when there is one attempt', () => {
          const courseCompletionPass = courseCompletionFactory.build({
            status: 'Passed',
            attempts: 1,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionPass,
            allCourseCompletions: [courseCompletionPass],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Passed'),
          )
        })

        it('returns row with attempts in order when there are two attempts', () => {
          const courseCompletionPass = courseCompletionFactory.build({
            status: 'Passed',
            attempts: 2,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })
          const courseCompletionFailure = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 1,
            completionDateTime: new Date('2020-01-08').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionPass,
            allCourseCompletions: [courseCompletionFailure, courseCompletionPass],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 2')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Passed'),
          )

          expect(courseCompletionRows[1].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[1].value.html).toContain('8 January 2020')
          expect(courseCompletionRows[1].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )
        })

        it('returns row with attempts in order when there are three attempts', () => {
          const courseCompletionPass = courseCompletionFactory.build({
            status: 'Passed',
            attempts: 3,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })
          const courseCompletionFirstFailure = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 1,
            completionDateTime: new Date('2020-01-07').toISOString(),
          })
          const courseCompletionSecondFailure = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 2,
            completionDateTime: new Date('2020-01-08').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionPass,
            allCourseCompletions: [courseCompletionSecondFailure, courseCompletionPass, courseCompletionFirstFailure],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 3')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Passed'),
          )

          expect(courseCompletionRows[1].key.text).toEqual('Attempt 2')
          expect(courseCompletionRows[1].value.html).toContain('8 January 2020')
          expect(courseCompletionRows[1].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[2].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[2].value.html).toContain('7 January 2020')
          expect(courseCompletionRows[2].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )
        })
      })

      describe('when all attempts are not present', () => {
        it('returns row with two placeholder attempts when the pass is the third attempt', () => {
          const courseCompletionPass = courseCompletionFactory.build({
            status: 'Passed',
            attempts: 3,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionPass,
            allCourseCompletions: [courseCompletionPass],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 3')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Passed'),
          )

          expect(courseCompletionRows[1].key.text).toEqual('Attempt 2')
          expect(courseCompletionRows[1].value.html).toContain('Details in Community Campus')
          expect(courseCompletionRows[1].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[2].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[2].value.html).toContain('Details in Community Campus')
          expect(courseCompletionRows[2].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )
        })

        it('returns row with one placeholder attempt when the pass is the second attempt', () => {
          const courseCompletionPass = courseCompletionFactory.build({
            status: 'Passed',
            attempts: 2,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionPass,
            allCourseCompletions: [courseCompletionPass],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 2')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Passed'),
          )

          expect(courseCompletionRows[1].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[1].value.html).toContain('Details in Community Campus')
          expect(courseCompletionRows[1].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[2]).toBeUndefined()
        })

        it('returns row with no placeholder attempts when the pass is the first attempt', () => {
          const courseCompletionPass = courseCompletionFactory.build({
            status: 'Passed',
            attempts: 1,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionPass,
            allCourseCompletions: [courseCompletionPass],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Passed'),
          )

          expect(courseCompletionRows[1]).toBeUndefined()
        })
      })
    })

    describe('Failures', () => {
      describe('when all attempts are present', () => {
        it('returns row with attempts in order', () => {
          const courseCompletionLastFail = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 3,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })
          const courseCompletionFirstFailure = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 1,
            completionDateTime: new Date('2020-01-07').toISOString(),
          })
          const courseCompletionSecondFailure = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 2,
            completionDateTime: new Date('2020-01-08').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionLastFail,
            allCourseCompletions: [
              courseCompletionSecondFailure,
              courseCompletionLastFail,
              courseCompletionFirstFailure,
            ],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 3')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[1].key.text).toEqual('Attempt 2')
          expect(courseCompletionRows[1].value.html).toContain('8 January 2020')
          expect(courseCompletionRows[1].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[2].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[2].value.html).toContain('7 January 2020')
          expect(courseCompletionRows[2].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )
        })
      })

      describe('when all attempts are not present', () => {
        it('returns row with two placeholder attempts', () => {
          const courseCompletionLastFail = courseCompletionFactory.build({
            status: 'Failed',
            attempts: 3,
            completionDateTime: new Date('2020-01-09').toISOString(),
          })

          const courseCompletionRows = CourseCompletionUtils.completionDetailsRows({
            courseCompletion: courseCompletionLastFail,
            allCourseCompletions: [courseCompletionLastFail],
          })

          expect(courseCompletionRows[0].key.text).toEqual('Attempt 3')
          expect(courseCompletionRows[0].value.html).toContain('9 January 2020')
          expect(courseCompletionRows[0].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[1].key.text).toEqual('Attempt 2')
          expect(courseCompletionRows[1].value.html).toContain('Details in Community Campus')
          expect(courseCompletionRows[1].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )

          expect(courseCompletionRows[2].key.text).toEqual('Attempt 1')
          expect(courseCompletionRows[2].value.html).toContain('Details in Community Campus')
          expect(courseCompletionRows[2].value.html).toContain(
            CourseCompletionUtils.formattedCourseCompletionLabel('Failed'),
          )
        })
      })
    })
  })
})
