import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import AlertPractitionerQuestion from './alertPractitionerQuestion'

describe('AlertPractitionerQuestion', () => {
  describe('validate', () => {
    it('returns an error when no alert selection is made', () => {
      expect(AlertPractitionerQuestion.validate({})).toEqual({
        alertPractitioner: { text: 'Choose whether you want to send an alert' },
      })
    })

    it('returns no errors when an alert selection is made', () => {
      expect(AlertPractitionerQuestion.validate({ alertPractitioner: 'yes' })).toEqual({})
    })
  })

  describe('viewData', () => {
    it('shows the will-alert message when the outcome will alert the enforcement diary', () => {
      const form = { contactOutcome: contactOutcomeFactory.build({ willAlertEnforcementDiary: true }) }

      const result = AlertPractitionerQuestion.viewData(form)

      expect(result.showWillAlertPractitionerMessage).toBe(true)
      expect(result.alertDiaryText).toEqual('Would you also like this to be sent to the alert diary?')
    })

    it('does not show the will-alert message when the outcome will not alert the enforcement diary', () => {
      const form = { contactOutcome: contactOutcomeFactory.build({ willAlertEnforcementDiary: false }) }

      const result = AlertPractitionerQuestion.viewData(form)

      expect(result.showWillAlertPractitionerMessage).toBe(false)
      expect(result.alertDiaryText).toEqual('Would you like this to be sent to the alert diary?')
    })

    it('defaults showWillAlertPractitionerMessage to false when contactOutcome is not present', () => {
      const result = AlertPractitionerQuestion.viewData({})

      expect(result.showWillAlertPractitionerMessage).toBe(false)
    })

    it('returns unchecked items when no current alert value is provided', () => {
      const form = { contactOutcome: contactOutcomeFactory.build() }

      const result = AlertPractitionerQuestion.viewData(form)

      expect(result.alertPractitionerItems).toEqual([
        { text: 'Yes', value: 'yes', checked: false },
        { text: 'No', value: 'no', checked: false },
      ])
    })

    it('checks yes when the current alert value is true', () => {
      const form = { contactOutcome: contactOutcomeFactory.build() }

      const result = AlertPractitionerQuestion.viewData(form, true)

      expect(result.alertPractitionerItems).toEqual([
        { text: 'Yes', value: 'yes', checked: true },
        { text: 'No', value: 'no', checked: false },
      ])
    })

    it('checks no when the current alert value is false', () => {
      const form = { contactOutcome: contactOutcomeFactory.build() }

      const result = AlertPractitionerQuestion.viewData(form, false)

      expect(result.alertPractitionerItems).toEqual([
        { text: 'Yes', value: 'yes', checked: false },
        { text: 'No', value: 'no', checked: true },
      ])
    })

    it('delegates checked value resolution to GovUkRadioGroup.determineCheckedValue', () => {
      const determineCheckedValueSpy = jest.spyOn(GovUkRadioGroup, 'determineCheckedValue')
      const form = { contactOutcome: contactOutcomeFactory.build() }

      AlertPractitionerQuestion.viewData(form, true)

      expect(determineCheckedValueSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('isAlertSelected', () => {
    it.each([
      ['yes', true],
      ['no', false],
      [undefined, null],
    ])('returns %s for a value of %s', (value, expected) => {
      expect(
        AlertPractitionerQuestion.isAlertSelected({ alertPractitioner: value as 'yes' | 'no' | undefined }),
      ).toEqual(expected)
    })
  })
})
