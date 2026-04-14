import HoursAndMinutesInput from '../../forms/hoursAndMinutesInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import projectFactory from '../../testutils/factories/projectFactory'
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
    it('returns offender, paths and appointmentDetails', () => {
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

      const uiDate = '10 Jan 2024'
      const startTime = '09:00'
      const endTime = '17:00'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(uiDate)
      jest.spyOn(DateTimeFormats, 'stripTime').mockImplementation((time: string) => {
        return time === appointment.startTime ? startTime : endTime
      })

      const contactOutcomes = contactOutcomeFactory.buildList(2)
      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId,
        contactOutcomes,
        project,
      })

      expect(result).toEqual({
        offender,
        updatePath: paths.appointments.travelTime.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          taskId,
        }),
        completeTaskPath: paths.appointments.travelTime.complete({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          taskId,
        }),
        backLink: paths.appointments.travelTime.index({}),
        appointment: {
          date: uiDate,
          startTime,
          endTime,
          contactOutcome: undefined,
        },
        project: {
          name: project.projectName,
          type: project.projectType.name,
        },
      })

      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(appointment.date)
      expect(DateTimeFormats.stripTime).toHaveBeenCalledWith(appointment.startTime)
      expect(DateTimeFormats.stripTime).toHaveBeenCalledWith(appointment.endTime)
    })

    it('returns contact outcome name when it matches the appointment code', () => {
      const contactOutcomeName = 'Attended'
      const appointment = appointmentFactory.build()

      const matchingContactOutcome = contactOutcomeFactory.build({
        code: appointment.contactOutcomeCode,
        name: contactOutcomeName,
      })

      const contactOutcomes = [contactOutcomeFactory.build(), matchingContactOutcome]
      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId: '1',
        contactOutcomes,
        project,
      })

      expect(result.appointment.contactOutcome).toBe(contactOutcomeName)
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

  describe('updatePath', () => {
    it('returns travel time page path', () => {
      const taskId = '1'
      const appointment = appointmentFactory.build()

      const result = page.updatePath(appointment, taskId)

      expect(result).toEqual(
        paths.appointments.travelTime.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          taskId,
        }),
      )
    })
  })

  describe('successMessage', () => {
    const formattedDate = '12 January 2026'
    const formattedMinutes = '1 hour 20 minutes'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(formattedDate)
      jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockReturnValue(formattedMinutes)
    })

    describe('given minutes', () => {
      it('returns time credited message with crn given limited offender', () => {
        const appointment = appointmentFactory.build()
        const offender = {
          name: '',
          crn: 'CRN123',
          isLimited: true,
        }
        offenderMock.mockImplementation(() => offender)

        const result = page.successMessage(appointment, 80)

        expect(result).toBe(
          `The appointment for CRN: ${offender.crn} on ${formattedDate} has been adjusted for ${formattedMinutes} of travel time.`,
        )
      })

      it('returns time credited message with name given full offender', () => {
        const appointment = appointmentFactory.build()
        const offender = {
          name: 'Mary Smith',
          crn: 'CRN123',
          isLimited: false,
        }
        offenderMock.mockImplementation(() => offender)

        const result = page.successMessage(appointment, 80)

        expect(result).toBe(
          `Mary Smith's appointment on ${formattedDate} has been adjusted for ${formattedMinutes} of travel time.`,
        )
      })
    })

    describe('no minutes', () => {
      it('returns not eligible message with crn given limited offender', () => {
        const appointment = appointmentFactory.build()
        const offender = {
          name: '',
          crn: 'CRN123',
          isLimited: true,
        }
        offenderMock.mockImplementation(() => offender)

        const result = page.successMessage(appointment)

        expect(result).toBe(
          `The appointment for CRN: ${offender.crn} on ${formattedDate} has been recorded as not eligible for travel time.`,
        )
      })

      it('returns not eligible message with name given full offender', () => {
        const appointment = appointmentFactory.build()
        const offender = {
          name: 'Mary Smith',
          crn: 'CRN123',
          isLimited: false,
        }
        offenderMock.mockImplementation(() => offender)

        const result = page.successMessage(appointment)

        expect(result).toBe(
          `Mary Smith's appointment on ${formattedDate} has been recorded as not eligible for travel time.`,
        )
      })
    })
  })
})
