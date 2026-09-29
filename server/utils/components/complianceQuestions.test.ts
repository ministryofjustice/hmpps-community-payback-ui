import { AttendanceDataDto } from '../../@types/shared'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../testutils/factories/attendanceDataFactory'
import ComplianceQuestions from './complianceQuestions'

describe('ComplianceQuestions', () => {
  describe('getComplianceAnswers', () => {
    it('returns work quality and behaviour answers when both are present', () => {
      const form = appointmentOutcomeFormFactory.build({
        attendanceData: attendanceDataFactory.build({ workQuality: 'GOOD', behaviour: 'EXCELLENT' }),
      })

      const result = ComplianceQuestions.getAnswerSummary(form)

      expect(result).toBe('Work quality - Good<br>Behaviour - Excellent')
    })

    it('returns only work quality answer when behaviour is not present', () => {
      const form = appointmentOutcomeFormFactory.build({
        attendanceData: attendanceDataFactory.build({ workQuality: 'GOOD', behaviour: null }),
      })

      const result = ComplianceQuestions.getAnswerSummary(form)

      expect(result).toBe('Work quality - Good<br>')
    })

    it('returns only behaviour answer when work quality is not present', () => {
      const form = appointmentOutcomeFormFactory.build({
        attendanceData: attendanceDataFactory.build({ workQuality: null, behaviour: 'EXCELLENT' }),
      })

      const result = ComplianceQuestions.getAnswerSummary(form)

      expect(result).toBe('Behaviour - Excellent')
    })

    it('returns an empty string when neither is present', () => {
      const form = appointmentOutcomeFormFactory.build({
        attendanceData: attendanceDataFactory.build({ workQuality: null, behaviour: null }),
      })

      const result = ComplianceQuestions.getAnswerSummary(form)

      expect(result).toBe('')
    })

    it('returns an empty string when attendanceData is not present', () => {
      const form = appointmentOutcomeFormFactory.build({ attendanceData: undefined })

      const result = ComplianceQuestions.getAnswerSummary(form)

      expect(result).toBe('')
    })
  })

  describe('updateFormData', () => {
    it('updates and returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build({ startTime: '10:00', attendanceData: { penaltyMinutes: 60 } })
      const query = {
        workQuality: 'EXCELLENT' as AttendanceDataDto['workQuality'],
        behaviour: 'GOOD' as AttendanceDataDto['behaviour'],
      }

      const result = ComplianceQuestions.updateFormData(form, query)

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
  describe('validate', () => {
    describe('when workQuality is not present', () => {
      it('should return the correct error', () => {
        const errors = ComplianceQuestions.validate({ workQuality: null, behaviour: 'GOOD' })

        expect(errors.workQuality).toEqual({
          text: 'Select their work quality',
        })
      })
    })

    describe('when behaviour is not present', () => {
      it('should return the correct error', () => {
        const errors = ComplianceQuestions.validate({ behaviour: null, workQuality: 'EXCELLENT' })

        expect(errors.behaviour).toEqual({
          text: 'Select their behaviour',
        })
      })
    })
  })

  describe('viewData', () => {
    describe('workQuality', () => {
      it('should return items for workQuality without checked answer from form', async () => {
        const form = appointmentOutcomeFormFactory.build({
          attendanceData: attendanceDataFactory.build({ workQuality: null }),
        })

        const result = ComplianceQuestions.viewData(form, {})
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
        const form = appointmentOutcomeFormFactory.build({
          attendanceData: attendanceDataFactory.build({ workQuality: 'GOOD' }),
        })

        const result = ComplianceQuestions.viewData(form, {})
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
        const form = appointmentOutcomeFormFactory.build({ attendanceData: { behaviour: null } })

        const result = ComplianceQuestions.viewData(form, {})
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
        const form = appointmentOutcomeFormFactory.build({
          attendanceData: attendanceDataFactory.build({ behaviour: 'UNSATISFACTORY' }),
        })

        const result = ComplianceQuestions.viewData(form)
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

      const result = ComplianceQuestions.viewData(formData, { workQuality: 'EXCELLENT' })

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
