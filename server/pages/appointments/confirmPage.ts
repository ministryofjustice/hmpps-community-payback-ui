import { AppointmentDto, ContactOutcomeDto, SessionDto } from '../../@types/shared'
import { GovUkRadioOrCheckboxOption, GovUkSummaryListItem, ValidationErrors, YesOrNo } from '../../@types/user-defined'
import { AppointmentOutcomeForm, UpdateSessionForm } from '../../services/forms/appointmentFormService'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import Offender from '../../models/offender'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import NotesUtils from '../../utils/components/notesUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData {
  alertPractitionerItems: GovUkRadioOrCheckboxOption[]
  showWillAlertPractitionerMessage: boolean
  alertDiaryText: string
  submittedItems: GovUkSummaryListItem[]
}

interface Query {
  alertPractitioner?: YesOrNo
}

export default class ConfirmPage extends BaseAppointmentUpdatePage<Query> {
  protected getValidationErrors(_query: Query, _additionalParams?: unknown): ValidationErrors<Query> {
    throw new Error('Method not implemented.')
  }

  protected page: AppointmentFormPage = 'confirm-details'

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }

  viewData(args: {
    form: AppointmentOutcomeForm
    appointment: AppointmentDto
    appointmentSummaries?: SessionDto['appointmentSummaries']
    pathData: { projectCode: string; date?: string; appointmentId?: string; formId: string }
    isSingleAppointment: boolean
  }): ViewData {
    const showWillAlertPractitionerMessage = args.form.contactOutcome?.willAlertEnforcementDiary ?? false
    const alertValue = args.form.alertActive

    return {
      submittedItems: this.formItems(args),
      showWillAlertPractitionerMessage,
      alertPractitionerItems: GovUkRadioGroup.yesNoItems({
        checkedValue: GovUkRadioGroup.determineCheckedValue(alertValue),
      }),
      alertDiaryText: `Would you ${showWillAlertPractitionerMessage ? 'also' : ''} like this to be sent to the alert diary?`,
    }
  }

  getAlertSelected(alertPractitioner?: YesOrNo): boolean | null {
    return GovUkRadioGroup.nullableValueFromYesOrNoItem(alertPractitioner)
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

  protected backPage(_isSingleAppointment: boolean, form?: AppointmentOutcomeForm): AppointmentFormPage {
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

  private formItems({
    form,
    pathData,
    appointment,
    appointmentSummaries,
    isSingleAppointment,
  }: {
    form: AppointmentOutcomeForm
    appointment: AppointmentDto
    appointmentSummaries?: SessionDto['appointmentSummaries']
    pathData: { projectCode: string; date?: string; appointmentId?: string; formId: string }
    isSingleAppointment: boolean
  }): GovUkSummaryListItem[] {
    const items = [
      ...this.buildOffenderItem(
        form,
        this.changePath('select-people', pathData, isSingleAppointment),
        appointmentSummaries,
      ),
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
              href: this.changePath('choose-supervisor', pathData, isSingleAppointment),
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
              href: this.changePath('choose-project', pathData, isSingleAppointment),
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
              href: this.changePath('choose-project', pathData, isSingleAppointment),
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
              href: this.changePath('attendance-outcome', pathData, isSingleAppointment),
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
                  href: this.changePath('log-hours', pathData, isSingleAppointment),
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
                  href: this.changePath('log-compliance', pathData, isSingleAppointment),
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
        this.changePath('attendance-outcome', pathData, isSingleAppointment),
        appointment,
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
    form: UpdateSessionForm,
    path: string,
    appointmentSummaries?: SessionDto['appointmentSummaries'],
  ): Array<GovUkSummaryListItem> {
    if (!appointmentSummaries) {
      return []
    }

    const offenderDescriptions = form.appointments
      ?.map(appointment => {
        const appointmentSummary = appointmentSummaries.find(summary => summary.id === appointment.id)
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
              href: path,
              text: 'Change',
              visuallyHiddenText: 'people',
            },
          ],
        },
      },
    ]
  }

  private changePath(
    page: AppointmentFormPage,
    {
      projectCode,
      date,
      appointmentId,
      formId,
    }: { projectCode: string; date?: string; appointmentId?: string; formId: string },
    isSingleAppointment: boolean,
  ) {
    if (isSingleAppointment) {
      return this.pathWithFormId(
        paths.appointments.update({
          projectCode,
          appointmentId,
          page,
        }),
        formId,
      )
    }

    return this.pathWithFormId(
      paths.sessions.update({
        projectCode,
        date,
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
