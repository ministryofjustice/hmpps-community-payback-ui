import { AppointmentDto, AttendanceDataDto } from '../../@types/shared'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import LogCompliancePage from './logCompliancePage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import ComplianceQuestions from '../../utils/components/complianceQuestions'

describe('LogCompliancePage', () => {
  let page: LogCompliancePage
  let appointment: AppointmentDto
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    it('should return compliance questions view data', () => {
      const items = {
        workQualityItems: [
          { text: 'Excellent', value: 'EXCELLENT', checked: true },
          { text: 'Good', value: 'GOOD', checked: false },
          { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
          { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
          { text: 'Poor', value: 'POOR', checked: false },
          { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
        ],

        behaviourItems: [
          { text: 'Excellent', value: 'EXCELLENT', checked: false },
          { text: 'Good', value: 'GOOD', checked: false },
          { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
          { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: true },
          { text: 'Poor', value: 'POOR', checked: false },
          { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
        ],
      }
      const formData = appointmentOutcomeFormFactory.build()
      jest.spyOn(ComplianceQuestions, 'viewData').mockReturnValue(items)
      page = new LogCompliancePage()

      const result = page.viewData(formData, { workQuality: 'EXCELLENT' })

      expect(result).toEqual(items)
      expect(ComplianceQuestions.viewData).toHaveBeenCalledWith(formData, { workQuality: 'EXCELLENT' })
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
        page: 'log-hours',
      })
    })

    it('should return an update path for the log compliance page', () => {
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
        page: 'log-compliance',
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
        page: 'log-compliance',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: pathData.projectCode,
        date: pathData.date,
        page: 'log-hours',
      })
      expect(paths.appointments.update).not.toHaveBeenCalled()
      expect(result.backLink).toBe(pathWithQuery)
      expect(result.updatePath).toBe(pathWithQuery)
    })
  })

  describe('validate', () => {
    it('should return errors', () => {
      page = new LogCompliancePage()
      const error = {
        text: 'Select their work quality',
      }
      jest.spyOn(ComplianceQuestions, 'validate').mockReturnValue({ workQuality: error })

      const { errors, hasErrors } = page.validationErrors({ workQuality: null, behaviour: 'GOOD' })

      expect(errors.workQuality).toEqual(error)
      expect(hasErrors).toBe(true)
    })
  })

  describe('next', () => {
    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      page = new LogCompliancePage()

      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ pathData: { projectCode, appointmentId } })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'confirm-details' })
    })

    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      const existingForm = appointmentOutcomeFormFactory.build()

      page = new LogCompliancePage()
      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ pathData: { projectCode, appointmentId }, form: existingForm })).toBe(pathWithQuery)
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
