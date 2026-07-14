import { AppointmentDto, ContactOutcomeDto } from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  GovUkRadioOrCheckboxOption,
  GovUkSummaryListItem,
  ValidationErrors,
  YesOrNo,
} from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import Offender from '../../models/offender'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import NotesUtils from '../../utils/components/notesUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData extends AppointmentUpdatePageViewData {
  alertPractitionerItems: GovUkRadioOrCheckboxOption[]
  showWillAlertPractitionerMessage: boolean
  alertDiaryText: string
  submittedItems: GovUkSummaryListItem[]
}

interface Query {
  alertPractitioner?: YesOrNo
}

export default class ConfirmPage extends BaseAppointmentUpdatePage<Query> {
  protected page: AppointmentFormPage = 'confirm-details'

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }

  protected getValidationErrors(_query: Query, _additionalParams?: unknown): ValidationErrors<Query> {
    return {}
  }

  viewData(appointmentOrSession: AppointmentOrSession, form: AppointmentOutcomeForm, formId?: string): ViewData {
    const showWillAlertPractitionerMessage = form.contactOutcome?.willAlertEnforcementDiary ?? false
    const alertValue = this.isSingleAppointment(appointmentOrSession) ? appointmentOrSession.alertActive : undefined

    return {
      ...this.commonViewData({ appointmentOrSession, form, formId }),
      submittedItems: this.formItems(form, appointmentOrSession, formId),
      showWillAlertPractitionerMessage,
      alertPractitionerItems: GovUkRadioGroup.yesNoItems({
        checkedValue: GovUkRadioGroup.determineCheckedValue(alertValue),
      }),
      alertDiaryText: `Would you ${showWillAlertPractitionerMessage ? 'also' : ''} like this to be sent to the alert diary?`,
    }
  }

  isAlertSelected(query: Query): boolean | null {
    return GovUkRadioGroup.nullableValueFromYesOrNoItem(query.alertPractitioner)
  }

  deliusVersionChangedMessage(appointments: Array<AppointmentDto>): string {
    const appointmentText = appointments.length === 1 ? 'appointment' : 'appointments'
    const haveHas = appointments.length === 1 ? 'has' : 'have'
    const appointmentIdentifiers = appointments.map(appointment => {
      const offender = new Offender(appointment.offender)
      return offender.details.description
    })
    return `The ${appointmentText} for ${appointmentIdentifiers.join(', ')} ${haveHas} already been updated in the database. Try again.`
  }

  protected nextPage(): AppointmentFormPage | undefined {
    return undefined
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession, form?: AppointmentOutcomeForm): AppointmentFormPage {
    if (form && form.contactOutcome?.attended) {
      return 'log-compliance'
    }
    return 'attendance-outcome'
  }

  private getStartAndEndTime(form: AppointmentOutcomeForm) {
    const { startTime, endTime } = form
    const hours = DateTimeFormats.timeBetween(startTime, endTime)

    return HtmlUtils.getElementsWithContent(
      [DateTimeFormats.timePeriod(startTime, endTime), this.hoursCreditedText(hours)],
      'p',
    )
  }

  private hoursCreditedText(hours: string) {
    return `Hours credited: ${hours}`
  }

  private formItems(
    form: AppointmentOutcomeForm,
    appointment: AppointmentOrSession,
    formId: string,
  ): GovUkSummaryListItem[] {
    const isSingleAppointment = this.isSingleAppointment(appointment)
    const items = [
      ...this.buildOffenderItem(form, appointment, formId),
      {
        key: {
          text: 'Supervising officer',
        },
        value: {
          text: form.supervisor.fullName,
        },
        actions: {
          items: [
            {
              href: this.changePath(appointment, 'choose-supervisor', formId),
              text: 'Change',
              visuallyHiddenText: 'supervising officer',
            },
          ],
        },
      },
      {
        key: {
          text: 'Project team',
        },
        value: {
          text: form.projectTeam.name,
        },
        actions: {
          items: [
            {
              href: this.changePath(appointment, 'choose-project', formId),
              text: 'Change',
              visuallyHiddenText: 'project team',
            },
          ],
        },
      },
      {
        key: {
          text: 'Project',
        },
        value: {
          text: form.project.name,
        },
        actions: {
          items: [
            {
              href: this.changePath(appointment, 'choose-project', formId),
              text: 'Change',
              visuallyHiddenText: 'project',
            },
          ],
        },
      },
      {
        key: {
          text: 'Outcome',
        },
        value: this.outcomeValue(form.contactOutcome),
        actions: {
          items: [
            {
              href: this.changePath(appointment, 'attendance-outcome', formId),
              text: 'Change',
              visuallyHiddenText: 'attendance outcome',
            },
          ],
        },
      },
    ]

    if (form.contactOutcome?.attended) {
      items.push(
        ...[
          {
            key: {
              text: 'Start and end time',
            },
            value: {
              html: this.getStartAndEndTime(form),
            },
            actions: {
              items: [
                {
                  href: this.changePath(appointment, 'log-hours', formId),
                  text: 'Change',
                  visuallyHiddenText: 'start and end time',
                },
              ],
            },
          },
          {
            key: {
              text: 'Compliance',
            },
            value: {
              html: this.getComplianceAnswers(form),
            },
            actions: {
              items: [
                {
                  href: this.changePath(appointment, 'log-compliance', formId),
                  text: 'Change',
                  visuallyHiddenText: 'compliance',
                },
              ],
            },
          },
        ],
      )
    }

    items.push(
      ...NotesUtils.checkYourAnswersRows(
        form,
        this.changePath(appointment, 'attendance-outcome', formId),
        isSingleAppointment ? appointment : undefined,
        isSingleAppointment,
      ),
    )

    return items
  }

  private outcomeValue(contactOutcome?: ContactOutcomeDto) {
    if (contactOutcome?.attended) {
      return { text: contactOutcome?.name }
    }

    return {
      html: HtmlUtils.getElementsWithContent([contactOutcome?.name, this.hoursCreditedText('0')], 'p'),
    }
  }

  buildOffenderItem(
    form: AppointmentOutcomeForm,
    appointmentOrSession: AppointmentOrSession,
    formId: string,
  ): Array<GovUkSummaryListItem> {
    if (this.isSingleAppointment(appointmentOrSession)) {
      return []
    }

    const offenderDescriptions = form.appointments
      ?.map(appointment => {
        const appointmentSummary = appointmentOrSession.appointmentSummaries.find(
          summary => summary.id === appointment.id,
        )
        if (!appointmentSummary) {
          return undefined
        }
        const offender = new Offender(appointmentSummary.offender)
        return offender.details.description
      })
      .filter(description => description !== undefined)
      .join(' <br/>')

    return [
      {
        key: {
          text: 'People',
        },
        value: {
          html: offenderDescriptions,
        },
        actions: {
          items: [
            {
              href: this.changePath(appointmentOrSession, 'select-people', formId),
              text: 'Change',
              visuallyHiddenText: 'people',
            },
          ],
        },
      },
    ]
  }

  private changePath(appointmentOrSession: AppointmentOrSession, page: AppointmentFormPage, formId: string) {
    if ('deliusEventNumber' in appointmentOrSession) {
      return this.pathWithFormId(
        paths.appointments.update({
          projectCode: appointmentOrSession.projectCode,
          appointmentId: appointmentOrSession.id.toString(),
          page,
        }),
        formId,
      )
    }

    return this.pathWithFormId(
      paths.sessions.update({
        projectCode: appointmentOrSession.projectCode,
        date: appointmentOrSession.date,
        page,
      }),
      formId,
    )
  }

  getComplianceAnswers(form: AppointmentOutcomeForm): string {
    let answers = ''

    if (form.attendanceData?.workQuality) {
      answers += `Work quality - ${AppointmentUtils.formatComplianceRatings(form.attendanceData.workQuality)}<br>`
    }

    if (form.attendanceData?.behaviour) {
      answers += `Behaviour - ${AppointmentUtils.formatComplianceRatings(form.attendanceData.behaviour)}`
    }

    return answers
  }
}
