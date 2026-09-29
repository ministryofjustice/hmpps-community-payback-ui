import { ContactOutcomeDto } from '../../@types/shared'
import { GovUkRadioOrCheckboxOption, ValidationErrors, YesOrNo } from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'

export type AlertPractitionerQuestionBody = {
  alertPractitioner?: YesOrNo
}

export type AlertPractitionerQuestionViewData = {
  alertPractitionerItems: GovUkRadioOrCheckboxOption[]
  showWillAlertPractitionerMessage: boolean
  alertDiaryText: string
}

export default class AlertPractitionerQuestion {
  static validate(body: AlertPractitionerQuestionBody): ValidationErrors<AlertPractitionerQuestionBody> {
    if (!body.alertPractitioner) {
      return { alertPractitioner: { text: 'Choose whether you want to send an alert' } }
    }

    return {}
  }

  static viewData(
    form: { contactOutcome?: ContactOutcomeDto },
    currentAlertValue?: boolean,
  ): AlertPractitionerQuestionViewData {
    const showWillAlertPractitionerMessage = form.contactOutcome?.willAlertEnforcementDiary ?? false

    return {
      showWillAlertPractitionerMessage,
      alertPractitionerItems: GovUkRadioGroup.yesNoItems({
        checkedValue: GovUkRadioGroup.determineCheckedValue(currentAlertValue),
      }),
      alertDiaryText: `Would you${showWillAlertPractitionerMessage ? ' also' : ''} like this to be sent to the alert diary?`,
    }
  }

  static isAlertSelected(body: AlertPractitionerQuestionBody): boolean | null {
    return GovUkRadioGroup.nullableValueFromYesOrNoItem(body.alertPractitioner)
  }
}
