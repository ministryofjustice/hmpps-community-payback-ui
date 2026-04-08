import HoursAndMinutesInput from '../../forms/hoursAndMinutesInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import UpdateTravelTimePage from './updateTravelTimePage'

jest.mock('../../models/offender')

describe('UpdateTravelTimePage', () => {
  let page: UpdateTravelTimePage
  beforeEach(() => {
    jest.resetAllMocks()
    page = new UpdateTravelTimePage()
  })

  describe('validationErrors', () => {
    it('returns no errors if valid body', () => {
      const result = page.validationErrors({
        hours: '2',
        minutes: '20',
      })
      expect(result.errors).toEqual({})
      expect(result.hasErrors).toBe(false)
    })

    describe('hours and minutes', () => {
      it('should not return error for hours or minutes if no validation errors', () => {
        const body = { hours: '2' }
        jest.spyOn(HoursAndMinutesInput, 'validationErrors').mockReturnValue({})
        const result = page.validationErrors(body).errors
        expect(result.hours).toBeUndefined()
        expect(result.minutes).toBeUndefined()
      })

      it('should return error for hours and minutes if validation errors', () => {
        const hoursError = { text: 'hours error' }
        const minutesError = { text: 'minutes error' }
        const body = { minutes: 't' }
        jest
          .spyOn(HoursAndMinutesInput, 'validationErrors')
          .mockReturnValue({ hours: hoursError, minutes: minutesError })

        const result = page.validationErrors(body)
        expect(result.errors.minutes).toEqual(minutesError)
        expect(result.errors.hours).toEqual(hoursError)
        expect(result.hasErrors).toBe(true)
        expect(HoursAndMinutesInput.validationErrors).toHaveBeenCalledWith(body, 'travel time')
      })
    })
  })

  describe('viewData', () => {
    it('returns offender and paths', () => {
      const taskId = '1'
      const appointment = appointmentFactory.build()
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

      const offender = {
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
      }

      offenderMock.mockImplementation(() => {
        return offender
      })

      const result = page.viewData(appointment, taskId)

      expect(result).toEqual({
        offender,
        updatePath: paths.appointments.travelTime.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          taskId,
        }),
        backLink: paths.appointments.travelTime.index({}),
      })
    })
  })

  describe('requestBody', () => {
    it('returns object with total minutes and taskId', () => {
      const taskId = '12'
      const body = { hours: '1', minutes: '30' }
      const minutes = 123
      jest.spyOn(DateTimeFormats, 'hoursAndMinutesToMinutes').mockReturnValue(minutes)

      const result = page.requestBody(body, taskId)
      expect(result).toEqual({ taskId, minutes })
      expect(DateTimeFormats.hoursAndMinutesToMinutes).toHaveBeenCalledWith(body.hours, body.minutes)
    })
  })
})
