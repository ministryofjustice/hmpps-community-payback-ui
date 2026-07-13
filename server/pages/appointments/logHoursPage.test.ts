import { AppointmentDto } from '../../@types/shared'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import LogHoursPage from './logHoursPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

describe('LogHoursPage', () => {
  let page: LogHoursPage
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('validate', () => {
    describe('startTime', () => {
      describe('when startTime is not present', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ startTime: null })

          expect(errors.startTime).toEqual({
            text: 'Enter a start time',
          })
        })
      })

      describe('when startTime is not valid', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ startTime: '8475438' })

          expect(errors.startTime).toEqual({
            text: 'Enter a valid start time, for example 09:00',
          })
        })
      })

      describe('when startTime is present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ startTime: '09:00' })

          expect(errors.startTime).toBeUndefined()
        })
      })

      describe('when startTime is after endTime', () => {
        it('should return an error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ startTime: '09:00', endTime: '08:00' })

          expect(errors.startTime).toEqual({
            text: `Start time should be before 08:00`,
          })
        })
      })

      describe('when startTime is the same as endTime', () => {
        it('should return an error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ startTime: '09:00', endTime: '09:00' })

          expect(errors.startTime).toEqual({
            text: 'Start time should be before 09:00',
          })
        })
      })
    })

    describe('endTime', () => {
      describe('when endTime is not present', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ endTime: null })

          expect(errors.endTime).toEqual({
            text: 'Enter an end time',
          })
        })
      })

      describe('when endTime is not valid', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ endTime: '837:02' })

          expect(errors.endTime).toEqual({
            text: 'Enter a valid end time, for example 17:00',
          })
        })
      })

      describe('when endTime is present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage()
          const { errors } = page.validationErrors({ endTime: '17:00' })

          expect(errors.endTime).toBeUndefined()
        })
      })
    })
  })

  describe('viewData', () => {
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm
    const updatePath = '/update'

    beforeEach(() => {
      page = new LogHoursPage()
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build({ contactOutcome: contactOutcomeFactory.build({ attended: true }) })
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)
    })

    it('should return an object containing start time and end time', () => {
      const result = page.viewData(appointment, form)
      expect(result).toEqual(
        expect.objectContaining({
          startTime: form.startTime,
          endTime: form.endTime,
        }),
      )
    })

    it("should return an object containing the form's start time and end time", () => {
      const updatedForm = appointmentOutcomeFormFactory.build({
        startTime: '09:45',
        endTime: '14:35',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      const result = page.viewData(appointment, updatedForm)
      expect(result).toEqual(
        expect.objectContaining({
          startTime: updatedForm.startTime,
          endTime: updatedForm.endTime,
        }),
      )
    })

    it('should return empty strings when form start and end times are undefined', () => {
      const updatedForm = appointmentOutcomeFormFactory.build({
        startTime: undefined,
        endTime: undefined,
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      const result = page.viewData(appointment, updatedForm)

      expect(result).toEqual(
        expect.objectContaining({
          startTime: '',
          endTime: '',
        }),
      )
    })

    it('should return an object containing a back link to the attendance outcome page', async () => {
      jest.spyOn(paths.appointments, 'update')
      const result = page.viewData(appointment, form)

      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'attendance-outcome',
      })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return the update path for the page', () => {
      jest.spyOn(paths.appointments, 'update')
      const result = page.viewData(appointment, form)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'log-hours',
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return expected commonViewData when appointmentOrSession is a session', () => {
      const session = sessionFactory.build({ projectCode: 'P123', date: '2026-06-10' })

      jest.spyOn(paths.sessions, 'update')
      jest.spyOn(paths.appointments, 'update')

      const result = page.viewData(session, form)

      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'log-hours',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
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
      page.updateForm(form, {})

      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ projectCode, appointmentId, form: appointmentOutcomeFormFactory.build() })).toBe(pathWithQuery)
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

      const result = page.updateForm(form, query)

      const expected = {
        ...form,
        startTime: '09:00',
        endTime: '13:00',
      }

      expect(result).toEqual(expected)
    })
  })
})
