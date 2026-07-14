import { AppointmentDto } from '../../@types/shared'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import LogCompliancePage, { LogComplianceQuery } from './logCompliancePage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../testutils/factories/attendanceDataFactory'

describe('LogCompliancePage', () => {
  let page: LogCompliancePage
  let appointment: AppointmentDto
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    let form: AppointmentOutcomeForm

    beforeEach(() => {
      page = new LogCompliancePage()
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build()
    })

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/appointment/1'
      jest.spyOn(paths.appointments, 'update').mockReturnValue(backLink)

      const result = page.viewData(appointment, form)
      expect(result.backLink).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'log-hours',
      })
    })

    it('should return an object containing an update link for the form', async () => {
      const updatePath = '/update'
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)

      const result = page.viewData(appointment, form)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
        page: 'log-compliance',
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
        page: 'log-compliance',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'log-hours',
      })
      expect(paths.appointments.update).not.toHaveBeenCalled()

      expect(result.backLink).toBe(pathWithQuery)
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('items', () => {
      describe('workQuality', () => {
        it('should return items for workQuality without checked answer from form', async () => {
          form = appointmentOutcomeFormFactory.build({
            attendanceData: attendanceDataFactory.build({ workQuality: null }),
          })

          const result = page.viewData(appointment, form)
          expect(result.workQualityItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: false },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })

        it('should return items for workQuality with checked answer from form', async () => {
          form = appointmentOutcomeFormFactory.build({ attendanceData: { workQuality: 'GOOD' } })

          const result = page.viewData(appointment, form)
          expect(result.workQualityItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: true },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })
      })

      describe('behaviour', () => {
        it('should return items for behaviour without checked answer from form', async () => {
          form = appointmentOutcomeFormFactory.build({ attendanceData: { behaviour: null } })

          const result = page.viewData(appointment, form)
          expect(result.behaviourItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: false },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })

        it('should return items for behaviour with checked answer from form', async () => {
          form = appointmentOutcomeFormFactory.build({ attendanceData: { behaviour: 'UNSATISFACTORY' } })

          const result = page.viewData(appointment, form)
          expect(result.behaviourItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: false },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: true },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })
      })

      it('should return items from form if page has errors', () => {
        const formData = appointmentOutcomeFormFactory.build({
          attendanceData: {
            workQuality: 'POOR',
            behaviour: 'GOOD',
          },
        })
        page = new LogCompliancePage()
        page.validate({
          behaviour: null,
          workQuality: 'EXCELLENT',
        })

        const result = page.viewData(appointment, formData, undefined, {
          behaviour: null,
          workQuality: 'EXCELLENT',
        })

        expect(result).toEqual(
          expect.objectContaining({
            workQualityItems: [
              { text: 'Excellent', value: 'EXCELLENT', checked: true },
              { text: 'Good', value: 'GOOD', checked: false },
              { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
              { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
              { text: 'Poor', value: 'POOR', checked: false },
              { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
            ],
          }),
        )
      })
    })
  })

  describe('validate', () => {
    describe('when workQuality is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage()
        page.validate({ workQuality: null })

        expect(page.validationErrors.workQuality).toEqual({
          text: 'Select their work quality',
        })
        expect(page.hasError).toBe(true)
      })
    })

    describe('when behaviour is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage()
        page.validate({ behaviour: null })

        expect(page.validationErrors.behaviour).toEqual({
          text: 'Select their behaviour',
        })
        expect(page.hasError).toBe(true)
      })
    })
  })

  describe('next', () => {
    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      page = new LogCompliancePage()

      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ projectCode, appointmentId })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'confirm-details' })
    })

    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      const existingForm = appointmentOutcomeFormFactory.build()

      page = new LogCompliancePage()
      page.updateForm(existingForm, {})

      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ projectCode, appointmentId })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'confirm-details' })
    })
  })

  describe('form', () => {
    beforeEach(() => {
      jest.spyOn(GovUkRadioGroup, 'valueFromYesOrNoItem').mockReturnValue(false)
    })

    it('updates and returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build({ startTime: '10:00', attendanceData: { penaltyMinutes: 60 } })
      const query: LogComplianceQuery = {
        workQuality: 'EXCELLENT',
        behaviour: 'GOOD',
      }

      page = new LogCompliancePage()

      const result = page.updateForm(form, query)

      const expected = {
        ...form,
        startTime: '10:00',
        attendanceData: {
          penaltyMinutes: 60,
          workQuality: 'EXCELLENT',
          behaviour: 'GOOD',
        },
      }

      expect(result).toEqual(expected)
    })
  })
})
