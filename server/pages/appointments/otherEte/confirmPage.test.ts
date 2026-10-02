import ConfirmPage from './confirmPage'
import { buildOtherEtePath } from './pathMap'
import createAppointmentFormFactory from '../../../testutils/factories/createAppointmentFormFactory'
import { contactOutcomeFactory } from '../../../testutils/factories/contactOutcomeFactory'
import providerTeamSummaryFactory from '../../../testutils/factories/providerTeamSummaryFactory'
import attendanceDataFactory from '../../../testutils/factories/attendanceDataFactory'
import StartAndEndTimeQuestion from '../../../utils/components/startAndEndTimeQuestion'

describe('ConfirmPage', () => {
  const formId = 'form-1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formItems', () => {
    it('builds summary rows for project, date, outcome, times, compliance and notes', () => {
      const contactOutcome = contactOutcomeFactory.build({ name: 'Attended - complied' })
      const attendanceData = attendanceDataFactory.build({ workQuality: 'GOOD', behaviour: 'EXCELLENT' })
      const startAndEndTimeSummary = '<p>09:00 - 17:00</p><p>Hours credited: 8 hours</p>'
      jest.spyOn(StartAndEndTimeQuestion, 'getAnswerSummary').mockReturnValue(startAndEndTimeSummary)
      const form = createAppointmentFormFactory.build({
        provider: { code: 'PROVIDER-1', name: 'Region name' },
        projectTeam: providerTeamSummaryFactory.build({ name: 'Team name' }),
        project: { code: 'PROJECT-1', name: 'Project name' },
        date: '2026-01-15',
        startTime: '09:00',
        endTime: '17:00',
        contactOutcome,
        attendanceData,
        notes: 'Some notes',
        isSensitive: undefined,
      })

      const result = ConfirmPage.formItems(form, formId)

      expect(result).toEqual([
        {
          key: { text: 'Project team' },
          value: { text: 'Team name' },
          actions: {
            items: [
              {
                href: buildOtherEtePath('project', formId),
                text: 'Change',
                visuallyHiddenText: 'project team',
              },
            ],
          },
        },
        {
          key: { text: 'Project' },
          value: { text: 'Project name' },
          actions: {
            items: [{ href: buildOtherEtePath('project', formId), text: 'Change', visuallyHiddenText: 'project' }],
          },
        },
        {
          key: { text: 'Date' },
          value: { text: '15 January 2026' },
          actions: {
            items: [{ href: buildOtherEtePath('outcome', formId), text: 'Change', visuallyHiddenText: 'date' }],
          },
        },
        {
          key: { text: 'Outcome' },
          value: { text: 'Attended - complied' },
          actions: {
            items: [
              {
                href: buildOtherEtePath('outcome', formId),
                text: 'Change',
                visuallyHiddenText: 'attendance outcome',
              },
            ],
          },
        },
        {
          key: { text: 'Start and end time' },
          value: { html: startAndEndTimeSummary },
          actions: {
            items: [
              {
                href: buildOtherEtePath('outcome', formId),
                text: 'Change',
                visuallyHiddenText: 'start and end time',
              },
            ],
          },
        },
        {
          key: { text: 'Compliance' },
          value: { html: 'Work quality - Good<br>Behaviour - Excellent' },
          actions: {
            items: [
              {
                href: buildOtherEtePath('compliance', formId),
                text: 'Change',
                visuallyHiddenText: 'compliance',
              },
            ],
          },
        },
        {
          key: { text: 'Notes' },
          value: { text: 'Some notes' },
          actions: {
            items: [{ href: buildOtherEtePath('outcome', formId), text: 'Change', visuallyHiddenText: 'notes' }],
          },
        },
        {
          key: { text: 'Sensitive' },
          value: { text: 'Not entered' },
          actions: {
            items: [{ href: buildOtherEtePath('outcome', formId), text: 'Change', visuallyHiddenText: 'sensitivity' }],
          },
        },
      ])
      expect(StartAndEndTimeQuestion.getAnswerSummary).toHaveBeenCalledWith(form)
    })

    it('includes a region item when the region question is set to be shown in options', () => {
      const form = createAppointmentFormFactory.build({ options: { showRegionQuestion: true } })
      const result = ConfirmPage.formItems(form, formId)

      expect(result).toContainEqual({
        key: { text: 'Region' },
        value: { text: form.provider.name },
        actions: {
          items: [{ href: buildOtherEtePath('region', formId), text: 'Change', visuallyHiddenText: 'region' }],
        },
      })
    })

    it('shows an undefined outcome value when contactOutcome is undefined', () => {
      const form = createAppointmentFormFactory.build({ contactOutcome: undefined })

      const result = ConfirmPage.formItems(form, formId)

      expect(result).toContainEqual({
        key: { text: 'Outcome' },
        value: { text: undefined },
        actions: {
          items: [
            {
              href: buildOtherEtePath('outcome', formId),
              text: 'Change',
              visuallyHiddenText: 'attendance outcome',
            },
          ],
        },
      })
    })
  })

  describe('alertQuestionDetails', () => {
    it('shows the will-alert message when the outcome will alert the enforcement diary', () => {
      const form = createAppointmentFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ willAlertEnforcementDiary: true }),
      })

      const result = ConfirmPage.alertQuestionDetails(form)

      expect(result.showWillAlertPractitionerMessage).toBe(true)
      expect(result.alertDiaryText).toEqual('Would you also like this to be sent to the alert diary?')
      expect(result.alertPractitionerItems).toEqual([
        { text: 'Yes', value: 'yes', checked: false },
        { text: 'No', value: 'no', checked: false },
      ])
    })

    it('does not show the will-alert message when the outcome will not alert the enforcement diary', () => {
      const form = createAppointmentFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ willAlertEnforcementDiary: false }),
      })

      const result = ConfirmPage.alertQuestionDetails(form)

      expect(result.showWillAlertPractitionerMessage).toBe(false)
      expect(result.alertDiaryText).toEqual('Would you like this to be sent to the alert diary?')
    })
  })

  describe('isAlertSelected', () => {
    it.each([
      ['yes', true],
      ['no', false],
      [undefined, null],
    ])('returns %s for a value of %s', (value, expected) => {
      expect(ConfirmPage.isAlertSelected({ alertPractitioner: value as 'yes' | 'no' | undefined })).toEqual(expected)
    })
  })

  describe('validate', () => {
    it('returns an error when no alert selection is made', () => {
      expect(ConfirmPage.validate({})).toEqual({
        alertPractitioner: { text: 'Choose whether you want to send an alert' },
      })
    })

    it('returns no errors when an alert selection is made', () => {
      expect(ConfirmPage.validate({ alertPractitioner: 'yes' })).toEqual({})
    })
  })
})
