import { AppointmentDto, AttendanceDataDto } from '../../@types/shared'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import LogCompliancePage from './logCompliancePage'
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

    describe('items', () => {
      describe('workQuality', () => {
        it('should return items for workQuality without checked answer from form', async () => {
          form = appointmentOutcomeFormFactory.build({
            attendanceData: attendanceDataFactory.build({ workQuality: null }),
          })

          const result = page.viewData(form, {})
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
          form = appointmentOutcomeFormFactory.build({
            attendanceData: attendanceDataFactory.build({ workQuality: 'GOOD' }),
          })

          const result = page.viewData(form, {})
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

          const result = page.viewData(form, {})
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
          form = appointmentOutcomeFormFactory.build({
            attendanceData: attendanceDataFactory.build({ behaviour: 'UNSATISFACTORY' }),
          })

          const result = page.viewData(form)
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

      it('should return items from query if page has errors', () => {
        const formData = appointmentOutcomeFormFactory.build({
          attendanceData: {
            workQuality: 'POOR',
            behaviour: 'GOOD',
          },
        })
        page = new LogCompliancePage()
        const result = page.viewData(formData, { workQuality: 'EXCELLENT' })

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

  describe('commonViewData', () => {
    let form: AppointmentOutcomeForm

    beforeEach(() => {
      page = new LogCompliancePage()
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build()
    })

    it('should return a back link to the log hours page', () => {
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({ appointmentOrSession: appointment, form, formId: 'formId' })

      expect(result.backLink).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'log-hours',
      })
    })

    it('should return an update path for the log compliance page', () => {
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({ appointmentOrSession: appointment, form, formId: 'formId' })

      expect(result.updatePath).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
        page: 'log-compliance',
      })
    })

    it('should use session paths when appointmentOrSession is a session', () => {
      const session = sessionFactory.build({ projectCode: 'P123', date: '2026-06-10' })

      jest.spyOn(paths.sessions, 'update')
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({ appointmentOrSession: session, form, formId: 'formId' })

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
  })

  describe('validate', () => {
    describe('when workQuality is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage()
        const { errors, hasErrors } = page.validationErrors({ workQuality: null, behaviour: 'GOOD' })

        expect(errors.workQuality).toEqual({
          text: 'Select their work quality',
        })
        expect(hasErrors).toBe(true)
      })
    })

    describe('when behaviour is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage()
        const { errors, hasErrors } = page.validationErrors({ behaviour: null, workQuality: 'EXCELLENT' })

        expect(errors.behaviour).toEqual({
          text: 'Select their behaviour',
        })
        expect(hasErrors).toBe(true)
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
      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ projectCode, appointmentId, form: existingForm })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'confirm-details' })
    })
  })

  describe('form', () => {
    beforeEach(() => {
      jest.spyOn(GovUkRadioGroup, 'valueFromYesOrNoItem').mockReturnValue(false)
    })

    it('updates and returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build({ startTime: '10:00', attendanceData: { penaltyMinutes: 60 } })
      const query = {
        workQuality: 'EXCELLENT' as AttendanceDataDto['workQuality'],
        behaviour: 'GOOD' as AttendanceDataDto['behaviour'],
      }

      page = new LogCompliancePage()

      const result = page.updateForm(form, query, {})

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
