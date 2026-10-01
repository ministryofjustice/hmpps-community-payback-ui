import { GovUkSummaryListItem, ValidationErrors, YesOrNo } from '../../../@types/user-defined'
import { CreateAppointmentForm } from '../../../services/forms/appointmentFormService'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import NotesUtils from '../../../utils/components/notesUtils'
import ComplianceQuestions from '../../../utils/components/complianceQuestions'
import StartAndEndTimeQuestion from '../../../utils/components/startAndEndTimeQuestion'
import AlertPractitionerQuestion, {
  AlertPractitionerQuestionViewData,
} from '../../../utils/components/alertPractitionerQuestion'
import { buildOtherEtePath, OtherEteFormPage } from './pathMap'

export type ConfirmPageBody = {
  alertPractitioner?: YesOrNo
}

export default class ConfirmPage {
  static formItems(form: CreateAppointmentForm, formId?: string): GovUkSummaryListItem[] {
    return [
      {
        key: { text: 'Region' },
        value: { text: form.provider.name },
        actions: ConfirmPage.changeLink('region', 'region', formId),
      },
      {
        key: { text: 'Project team' },
        value: { text: form.projectTeam.name },
        actions: ConfirmPage.changeLink('project', 'project team', formId),
      },
      {
        key: { text: 'Project' },
        value: { text: form.project.name },
        actions: ConfirmPage.changeLink('project', 'project', formId),
      },
      {
        key: { text: 'Date' },
        value: { text: DateTimeFormats.isoDateToUIDate(form.date) },
        actions: ConfirmPage.changeLink('outcome', 'date', formId),
      },
      {
        key: { text: 'Outcome' },
        value: { text: form.contactOutcome?.name },
        actions: ConfirmPage.changeLink('outcome', 'attendance outcome', formId),
      },
      {
        key: { text: 'Start and end time' },
        value: { html: StartAndEndTimeQuestion.getAnswerSummary(form) },
        actions: ConfirmPage.changeLink('outcome', 'start and end time', formId),
      },
      {
        key: { text: 'Compliance' },
        value: { html: ComplianceQuestions.getAnswerSummary(form) },
        actions: ConfirmPage.changeLink('compliance', 'compliance', formId),
      },
      ...NotesUtils.checkYourAnswersRows(form, buildOtherEtePath('outcome', formId)),
    ]
  }

  static alertQuestionDetails(form: CreateAppointmentForm): AlertPractitionerQuestionViewData {
    return AlertPractitionerQuestion.viewData(form)
  }

  static isAlertSelected(body: ConfirmPageBody): boolean | null {
    return AlertPractitionerQuestion.isAlertSelected(body)
  }

  static validate(body: ConfirmPageBody): ValidationErrors<ConfirmPageBody> {
    return AlertPractitionerQuestion.validate(body)
  }

  private static changeLink(page: OtherEteFormPage, visuallyHiddenText: string, formId?: string) {
    return {
      items: [
        {
          href: buildOtherEtePath(page, formId),
          text: 'Change',
          visuallyHiddenText,
        },
      ],
    }
  }
}
