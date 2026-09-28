import { AppointmentDto } from '../../@types/shared'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import LogHoursPage from './logHoursPage'
import * as Utils from '../../utils/utils'
import * as ErrorUtils from '../../utils/errorUtils'
import StartAndEndTimeQuestion from '../../utils/components/startAndEndTimeQuestion'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

describe('LogHoursPage', () => {
  let page: LogHoursPage
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('getForm', () => {
    beforeEach(() => {
      page = new LogHoursPage()
    })

    it('should add a zero to times which are missing a leading zero', () => {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      const query = {
        startTime: '8:45',
        endTime: '9:45',
      }

      const result = page.getForm(form, query)
      expect(result).toEqual(
        expect.objectContaining({
          startTime: '08:45',
          endTime: '09:45',
        }),
      )
    })
  })

  describe('getValidationErrors', () => {
    it('returns hasErrors true when validation errors exist', () => {
      const errors = { startTime: { text: 'Enter a start time' } }
      const errorSummary = [{ text: 'Enter a start time', href: '#startTime', attributes: {} }]

      jest.spyOn(StartAndEndTimeQuestion, 'validate').mockReturnValue(errors)
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      page = new LogHoursPage()
      const body = { startTime: undefined, endTime: '17:00' } as { startTime?: string; endTime?: string }
      const result = page.validationErrors(body)

      expect(result).toEqual({
        errors,
        hasErrors: true,
        errorSummary,
      })
      expect(StartAndEndTimeQuestion.validate).toHaveBeenCalledWith(body)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(errors)
    })

    it('returns hasErrors false when validation errors are empty', () => {
      const errors = {}
      const errorSummary: ReturnType<typeof ErrorUtils.generateErrorSummary> = []

      jest.spyOn(StartAndEndTimeQuestion, 'validate').mockReturnValue(errors)
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      page = new LogHoursPage()
      const body = { startTime: '09:00', endTime: '17:00' }
      const result = page.validationErrors(body)

      expect(result).toEqual({
        errors,
        hasErrors: false,
        errorSummary,
      })
      expect(StartAndEndTimeQuestion.validate).toHaveBeenCalledWith(body)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(errors)
    })
  })

  describe('viewData', () => {
    let form: AppointmentOutcomeForm
    const updatePath = '/update'

    beforeEach(() => {
      page = new LogHoursPage()
      form = appointmentOutcomeFormFactory.build({ contactOutcome: contactOutcomeFactory.build({ attended: true }) })
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)
    })

    it('returns the result of StartAndEndTimeQuestion.viewData', () => {
      const viewData = { startTime: '09:45', endTime: '14:35' }
      jest.spyOn(StartAndEndTimeQuestion, 'viewData').mockReturnValue(viewData)

      const query = { startTime: '09:45', endTime: '14:35' }
      const result = page.viewData(form, query)

      expect(result).toEqual(viewData)
      expect(StartAndEndTimeQuestion.viewData).toHaveBeenCalledWith(form, query)
    })
  })

  describe('commonViewData', () => {
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm

    beforeEach(() => {
      page = new LogHoursPage()
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build({ contactOutcome: contactOutcomeFactory.build({ attended: true }) })
    })

    it('should return a back link to the attendance outcome page', () => {
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({
        pathData: {
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
          date: '2026-01-20',
        },
        appointmentOrSession: { appointment },
        form,
        formId: 'formId',
      })

      expect(result.backLink).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'attendance-outcome',
      })
    })

    it('should return an update path for the log hours page', () => {
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({
        pathData: {
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
          date: '2026-01-20',
        },
        appointmentOrSession: { appointment },
        form,
        formId: 'formId',
      })

      expect(result.updatePath).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
        page: 'log-hours',
      })
    })

    it('should use session paths when appointmentOrSession is a session', () => {
      const pathData = { projectCode: 'P123', date: '2026-06-10' }
      const session = sessionFactory.build()

      jest.spyOn(paths.sessions, 'update')
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({ pathData, appointmentOrSession: { session }, form, formId: 'formId' })

      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: pathData.projectCode,
        date: pathData.date,
        page: 'log-hours',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: pathData.projectCode,
        date: pathData.date,
        page: 'attendance-outcome',
      })
      expect(paths.appointments.update).not.toHaveBeenCalled()
      expect(result.backLink).toBe(pathWithQuery)
      expect(result.updatePath).toBe(pathWithQuery)
    })
  })

  describe('next', () => {
    it('should return log compliance link with given appointmentId', () => {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      page = new LogHoursPage()

      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ pathData: { projectCode, appointmentId }, form })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'log-compliance' })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const query = {
        startTime: '09:00',
        endTime: '13:00',
      }

      page = new LogHoursPage()

      const result = page.updateForm(form, query, {})

      const expected = {
        ...form,
        startTime: '09:00',
        endTime: '13:00',
      }

      expect(result).toEqual(expected)
    })
  })
})
