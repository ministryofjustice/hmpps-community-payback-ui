import {
  AppointmentDto,
  AppointmentSummaryDto,
  ContactOutcomeDto,
  ProjectTypeDto,
  CaseDetailsSummaryDto,
} from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOrSessionParams,
  GovUkRadioOrCheckboxOption,
  GovUkSummaryListItem,
  ValidationErrors,
  YesOrNo,
} from '../../@types/user-defined'
import { AppointmentOutcomeForm, CreateAppointmentForm } from '../../services/forms/appointmentFormService'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import Offender from '../../models/offender'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import NotesUtils from '../../utils/components/notesUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentPage } from './pathMap'
import UnpaidWorkUtils from '../../utils/unpaidWorkUtils'
import paths from '../../paths'

interface ViewData {
  alertPractitionerItems: GovUkRadioOrCheckboxOption[]
  showWillAlertPractitionerMessage: boolean
  alertDiaryText: string
}

interface Query {
  alertPractitioner?: YesOrNo
  outcome?: string
}

type ItemsOptions = { includeDateItem: boolean }
type ValidationContext = { form: AppointmentOutcomeForm; outcomeShouldBeAttended?: boolean }

export default class ConfirmPage extends BaseAppointmentUpdatePage<Query, ValidationContext> {
  protected page: AppointmentPage = 'confirm-details'

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }

  protected getValidationErrors(query: Query, additionalParams?: ValidationContext): ValidationErrors<Query> {
    const outcomeShouldBeAttended = additionalParams?.outcomeShouldBeAttended ?? false
    const form = additionalParams?.form
    const validationErrors: ValidationErrors<Query> = {}

    if (!query.alertPractitioner) {
      validationErrors.alertPractitioner = { text: 'Choose whether you want to send an alert' }
    }

    if (outcomeShouldBeAttended && !form?.contactOutcome?.attended) {
      validationErrors.outcome = { text: 'You can only create appointments with an attended outcome' }
    }

    return validationErrors
  }

  alertQuestionDetails(appointmentOrSession: AppointmentOrSession | undefined, form: AppointmentOutcomeForm): ViewData {
    const showWillAlertPractitionerMessage = form.contactOutcome?.willAlertEnforcementDiary ?? false
    const alertValue = this.appointmentAlertValue(appointmentOrSession)

    return {
      showWillAlertPractitionerMessage,
      alertPractitionerItems: GovUkRadioGroup.yesNoItems({
        checkedValue: GovUkRadioGroup.determineCheckedValue(alertValue),
      }),
      alertDiaryText: `Would you ${showWillAlertPractitionerMessage ? 'also' : ''} like this to be sent to the alert diary?`,
    }
  }

  private appointmentAlertValue(appointmentOrSession: AppointmentOrSession | undefined) {
    return appointmentOrSession?.appointment?.alertActive
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

  createFormItems({
    form,
    formId,
    offenderSummary,
    projectType,
  }: {
    form: CreateAppointmentForm
    formId: string
    offenderSummary: CaseDetailsSummaryDto
    projectType: ProjectTypeDto['group']
  }): GovUkSummaryListItem[] {
    const pathNamespace = projectType === 'INDIVIDUAL' ? 'projects' : 'sessions'

    const { projectCode, date } = form.originalParams

    const personPath = this.pathWithFormId(paths[pathNamespace].create.findAPerson({ projectCode, date }), formId)
    const personItem: GovUkSummaryListItem = {
      key: {
        text: 'Person',
      },
      value: {
        text: new Offender(offenderSummary.offender).details.description,
      },
      actions: {
        items: [
          {
            href: personPath,
            text: 'Change',
            visuallyHiddenText: 'person',
          },
        ],
      },
    }

    return [personItem, ...this.requirementItems({ form, formId, offenderSummary, pathNamespace })]
  }

  private requirementItems({
    form,
    formId,
    offenderSummary,
    pathNamespace,
  }: {
    form: CreateAppointmentForm
    formId: string
    offenderSummary: CaseDetailsSummaryDto
    pathNamespace: 'projects' | 'sessions'
  }): GovUkSummaryListItem[] {
    const { unpaidWorkDetails } = offenderSummary
    if (unpaidWorkDetails.length < 2) {
      return []
    }

    const { projectCode, date } = form.originalParams

    const requirement = unpaidWorkDetails.find(detail => detail.eventNumber === Number(form.deliusEventNumber))
    const requirementPath = this.pathWithFormId(
      paths[pathNamespace].create.requirement({
        crn: form.crn,
        projectCode,
        date,
      }),
      formId,
    )
    return [UnpaidWorkUtils.unpaidWorkSummaryItem(requirement, requirementPath)]
  }

  formItems(
    form: AppointmentOutcomeForm,
    pathData: AppointmentOrSessionParams | undefined,
    appointmentOrSession: AppointmentOrSession | undefined,
    formId?: string,
    options?: ItemsOptions,
  ): GovUkSummaryListItem[] {
    const { appointment, session } = appointmentOrSession ?? {}
    const items: GovUkSummaryListItem[] = []

    if (session) {
      items.push(...this.buildOffenderItem(form, session.appointmentSummaries, pathData, formId))
    }

    if (options?.includeDateItem) {
      items.push({
        key: {
          text: 'Date',
        },
        value: {
          text: DateTimeFormats.isoDateToUIDate(form.date),
        },
        actions: {
          items: [
            {
              href: this.buildPath('date', pathData, formId),
              text: 'Change',
              visuallyHiddenText: 'date',
            },
          ],
        },
      })
    }

    items.push(
      ...[
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
                href: this.buildPath('choose-supervisor', pathData, formId),
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
                href: this.buildPath('choose-project', pathData, formId),
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
                href: this.buildPath('choose-project', pathData, formId),
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
                href: this.buildPath('attendance-outcome', pathData, formId),
                text: 'Change',
                visuallyHiddenText: 'attendance outcome',
                attributes: { id: 'outcome' },
              },
            ],
          },
        },
      ],
    )

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
                  href: this.buildPath('log-hours', pathData, formId),
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
                  href: this.buildPath('log-compliance', pathData, formId),
                  text: 'Change',
                  visuallyHiddenText: 'compliance',
                },
              ],
            },
          },
        ],
      )
    }

    const isSession = session !== undefined

    items.push(
      ...NotesUtils.checkYourAnswersRows(
        form,
        this.buildPath('attendance-outcome', pathData, formId),
        appointment,
        !isSession,
      ),
    )

    return items
  }

  protected nextPage(): AppointmentPage | undefined {
    return undefined
  }

  protected backPage(_params: AppointmentOrSessionParams, form?: AppointmentOutcomeForm): AppointmentPage {
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

  private outcomeValue(contactOutcome?: ContactOutcomeDto) {
    if (contactOutcome?.attended) {
      return { text: contactOutcome?.name }
    }

    return {
      html: HtmlUtils.getElementsWithContent([contactOutcome?.name, this.hoursCreditedText('0')], 'p'),
    }
  }

  private buildOffenderItem(
    form: AppointmentOutcomeForm,
    appointmentSummaries: Array<AppointmentSummaryDto>,
    pathData: AppointmentOrSessionParams,
    formId: string,
  ): Array<GovUkSummaryListItem> {
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
              href: this.buildPath('select-people', pathData, formId),
              text: 'Change',
              visuallyHiddenText: 'people',
            },
          ],
        },
      },
    ]
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
