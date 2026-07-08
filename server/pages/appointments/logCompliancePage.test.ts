import { AttendanceDataDto } from '../../@types/shared'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import LogCompliancePage, { LogComplianceQuery } from './logCompliancePage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../testutils/factories/attendanceDataFactory'

describe('LogCompliancePage', () => {
  let page: LogCompliancePage
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    let form: AppointmentOutcomeForm

    beforeEach(() => {
      page = new LogCompliancePage()
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

      it('should return items from query if query has value', () => {
        const query = {
          workQuality: 'POOR' as AttendanceDataDto['workQuality'],
        }
        page = new LogCompliancePage()
        const result = page.viewData(form, query)

        expect(result).toEqual(
          expect.objectContaining({
            workQualityItems: [
              { text: 'Excellent', value: 'EXCELLENT', checked: false },
              { text: 'Good', value: 'GOOD', checked: false },
              { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
              { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
              { text: 'Poor', value: 'POOR', checked: true },
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
        const { errors, hasErrors } = page.validationErrors({ workQuality: null })

        expect(errors.workQuality).toEqual({
          text: 'Select their work quality',
        })
        expect(hasErrors).toBe(true)
      })
    })

    describe('when behaviour is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage()
        const { errors, hasErrors } = page.validationErrors({ behaviour: null })

        expect(errors.behaviour).toEqual({
          text: 'Select their behaviour',
        })
        expect(hasErrors).toBe(true)
      })
    })
  })

  describe('paths', () => {
    it('returns backLink and updatePath for an appointment', () => {
      const appointment = appointmentFactory.build()
      const formId = 'form-123'

      const result = page.paths({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        date: appointment.date,
        formId,
        form: appointmentOutcomeFormFactory.build(),
      })

      expect(result).toHaveProperty('backLink')
      expect(result).toHaveProperty('updatePath')
    })
  })

  describe('next', () => {
    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      page = new LogCompliancePage()

      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      expect(page.next({ projectCode, appointmentId, form: appointmentOutcomeFormFactory.build() })).toBe(pathWithQuery)
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

      expect(page.next({ projectCode, appointmentId, form: appointmentOutcomeFormFactory.build() })).toBe(pathWithQuery)
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
