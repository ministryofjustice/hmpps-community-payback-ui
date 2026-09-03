import { Request } from 'express'
import { createMock } from '@golevelup/ts-jest'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import projectFactory from '../../testutils/factories/projectFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { pathWithQuery } from '../../utils/utils'
import UpdateTravelTimePage from './updateTravelTimePage'

jest.mock('../../models/offender')

describe('UpdateTravelTimePage', () => {
  let page: UpdateTravelTimePage
  let req = createMock<Request>()

  beforeEach(() => {
    jest.resetAllMocks()
    page = new UpdateTravelTimePage()
    req = createMock<Request>({
      body: {},
    })
  })

  describe('validationErrors', () => {
    it('returns no errors if valid body', () => {
      const result = page.validationErrors({
        time: 60,
      })
      expect(result.errors).toEqual({})
      expect(result.hasErrors).toBe(false)
    })

    describe('time', () => {
      it('should not return error for time if no validation errors', () => {
        const body = { time: 60 }
        const result = page.validationErrors(body).errors
        expect(result.time).toBeUndefined()
      })

      it('should return error for time if validation errors', () => {
        const body = { time: 0 }

        const result = page.validationErrors(body)
        expect(result.errors.time).toEqual({ text: 'Select an amount of travel time' })
        expect(result.hasErrors).toBe(true)
      })
    })
  })

  describe('viewData', () => {
    it('returns offender, paths and appointmentDetails', () => {
      req = createMock<Request>({
        body: {},
      })
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

      const contactOutcome = contactOutcomeFactory.build()
      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId,
        contactOutcome,
        project,
        originalSearch: {},
        req,
      })

      expect(result).toEqual({
        heading: { title: offender.name, caption: offender.crn },
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
          contactOutcome: contactOutcome.name,
        },
        project: {
          name: project.projectName,
          type: project.projectType.name,
        },
        withAppointmentLink: false,
        appointmentLink: '',
      })

      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(appointment.date)
      expect(DateTimeFormats.stripTime).toHaveBeenCalledWith(appointment.startTime)
      expect(DateTimeFormats.stripTime).toHaveBeenCalledWith(appointment.endTime)
    })

    it('sets appointmentLink in the ViewData correctly', () => {
      req = createMock<Request>({
        body: {},
      })
      const taskId = '1'
      const appointment = appointmentFactory.build()

      const contactOutcome = contactOutcomeFactory.build()
      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId,
        contactOutcome,
        project,
        originalSearch: {},
        req,
        isTask: false,
      })

      const appointmentLink = paths.appointments.details({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })

      expect(result).toEqual(
        expect.objectContaining({
          backLink: appointmentLink,
          withAppointmentLink: true,
          appointmentLink,
        }),
      )
    })

    it('returns contact outcome name', () => {
      const contactOutcomeName = 'Attended'
      const appointment = appointmentFactory.build()
      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId: '1',
        contactOutcome: contactOutcomeFactory.build({ name: contactOutcomeName }),
        project,
        originalSearch: {},
        req,
      })

      expect(result.appointment.contactOutcome).toBe(contactOutcomeName)
    })

    it('returns search back link if any search params', () => {
      const appointment = appointmentFactory.build()
      const originalSearch = { provider: 'provider' }

      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId: '1',
        contactOutcome: contactOutcomeFactory.build(),
        project,
        originalSearch,
        req,
      })

      expect(result.backLink).toBe(pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch))
    })

    it('returns completeTask path with params if any params', () => {
      const appointment = appointmentFactory.build()
      const originalSearch = { provider: 'provider' }

      const project = projectFactory.build()

      const result = page.viewData({
        appointment,
        taskId: '1',
        contactOutcome: contactOutcomeFactory.build(),
        project,
        originalSearch,
        req,
      })

      expect(result.completeTaskPath).toBe(
        pathWithQuery(
          paths.appointments.travelTime.complete({
            taskId: '1',
            projectCode: appointment.projectCode,
            appointmentId: appointment.id.toString(),
          }),
          originalSearch,
        ),
      )
    })
  })

  describe('requestBody', () => {
    it('returns object with total minutes and taskId', () => {
      const communityPaybackAppointmentId = '12'
      const body = {
        time: 123,
      }
      const minutes = 123
      const adjustmentDate = '2026-05-20'
      jest.spyOn(DateTimeFormats, 'hoursAndMinutesToMinutes').mockReturnValue(minutes)

      const result = page.requestBody(
        body,
        appointmentFactory.build({ date: adjustmentDate, communityPaybackId: communityPaybackAppointmentId }),
      )
      expect(result).toEqual({ appointmentId: communityPaybackAppointmentId, minutes, adjustmentDate })
    })
  })

  describe('updatePath', () => {
    describe('when coming from the travel time tasks page', () => {
      const fromTravelTimeTasksPage = true

      it('returns travel time page path', () => {
        const taskId = '1'
        const appointment = appointmentFactory.build()

        const result = page.updatePath(appointment, taskId, {}, fromTravelTimeTasksPage)

        expect(result).toEqual(
          paths.appointments.travelTime.update({
            projectCode: appointment.projectCode,
            appointmentId: appointment.id.toString(),
            taskId,
          }),
        )
      })

      it('returns path with original search params', () => {
        const taskId = '1'
        const appointment = appointmentFactory.build()
        const originalSearch = { provider: 'provider' }

        const result = page.updatePath(appointment, taskId, originalSearch, fromTravelTimeTasksPage)

        expect(result).toEqual(
          pathWithQuery(
            paths.appointments.travelTime.update({
              projectCode: appointment.projectCode,
              appointmentId: appointment.id.toString(),
              taskId,
            }),
            originalSearch,
          ),
        )
      })
    })

    describe('when coming from the appointment page', () => {
      const fromTravelTimeTasksPage = false

      it('returns travel time page path', () => {
        const taskId = '1'
        const appointment = appointmentFactory.build()

        const result = page.updatePath(appointment, taskId, {}, fromTravelTimeTasksPage)

        expect(result).toEqual(
          paths.appointments.travelTime.create({
            projectCode: appointment.projectCode,
            appointmentId: appointment.id.toString(),
          }),
        )
      })

      it('returns path with original search params', () => {
        const taskId = '1'
        const appointment = appointmentFactory.build()
        const originalSearch = { provider: 'provider' }

        const result = page.updatePath(appointment, taskId, originalSearch, fromTravelTimeTasksPage)

        expect(result).toEqual(
          pathWithQuery(
            paths.appointments.travelTime.create({
              projectCode: appointment.projectCode,
              appointmentId: appointment.id.toString(),
            }),
            originalSearch,
          ),
        )
      })
    })
  })

  describe('exitPath', () => {
    describe('when coming from the travel time tasks page', () => {
      const fromTravelTimeTasksPage = true

      it('returns exit path when provider is present', () => {
        const originalSearch = { provider: 'provider' }

        const result = page.exitPath(originalSearch, undefined, fromTravelTimeTasksPage)

        expect(result).toEqual(pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch))
      })

      it('returns exit path when provider is not present', () => {
        const originalSearch = {}

        const result = page.exitPath(originalSearch, null, fromTravelTimeTasksPage)

        expect(result).toEqual(paths.appointments.travelTime.index({}))
      })
    })

    describe('when coming from the appointment page', () => {
      const fromTravelTimeTasksPage = false
      const appointment = appointmentFactory.build()

      it('returns exit path', () => {
        const originalSearch = {}

        const result = page.exitPath(originalSearch, appointment, fromTravelTimeTasksPage)

        expect(result).toEqual(
          paths.appointments.details({
            projectCode: appointment.projectCode,
            appointmentId: appointment.id.toString(),
          }),
        )
      })
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
