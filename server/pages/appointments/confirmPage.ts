import { AppointmentDto } from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkRadioOrCheckboxOption,
  GovUkSummaryListItem,
  YesOrNo,
} from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import Offender from '../../models/offender'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import NotesUtils from '../../utils/notesUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData extends AppointmentUpdatePageViewData {
  alertPractitionerItems: GovUkRadioOrCheckboxOption[]
  showWillAlertPractitionerMessage: boolean
  alertDiaryText: string
  submittedItems: GovUkSummaryListItem[]
}

interface Query extends AppointmentUpdateQuery {
  alertPractitioner?: YesOrNo
}

export default class ConfirmPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'confirm-details'

  constructor(private readonly query: Query) {
    super(query)
  }

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }

  viewData(appointmentOrSession: AppointmentOrSession, form: AppointmentOutcomeForm): ViewData {
    const showWillAlertPractitionerMessage = form.contactOutcome?.willAlertEnforcementDiary ?? false
    const alertValue = this.isSingleAppointment(appointmentOrSession) ? appointmentOrSession.alertActive : undefined
    this.form = form

    return {
      ...this.commonViewData({ appointmentOrSession, form }),
      submittedItems: this.formItems(form, appointmentOrSession),
      showWillAlertPractitionerMessage,
      alertPractitionerItems: GovUkRadioGroup.yesNoItems({
        checkedValue: GovUkRadioGroup.determineCheckedValue(alertValue),
      }),
      alertDiaryText: `Would you ${showWillAlertPractitionerMessage ? 'also' : ''} like this to be sent to the alert diary?`,
    }
  }

  get isAlertSelected(): boolean | null {
    return GovUkRadioGroup.nullableValueFromYesOrNoItem(this.query.alertPractitioner)
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

  protected backPage(): AppointmentFormPage {
    if (this.form && this.form.contactOutcome?.attended) {
      return 'log-compliance'
    }
    return 'attendance-outcome'
  }

  private getStartAndEndTime(form: AppointmentOutcomeForm) {
    const { startTime, endTime } = form
    const hours = !form.contactOutcome.attended ? 0 : DateTimeFormats.timeBetween(startTime, endTime)

    return `${DateTimeFormats.stripTime(startTime)} - ${DateTimeFormats.stripTime(endTime)}<br>Total hours worked: ${hours}`
  }

  private getCreditedHours(form: AppointmentOutcomeForm) {
    const penaltyTime = form.attendanceData?.penaltyMinutes
      ? DateTimeFormats.minutesToHoursAndMinutes(form.attendanceData.penaltyMinutes)
      : null

    if (!penaltyTime || penaltyTime === '00:00') {
      return `No penalty time applied<br>Total hours credited: ${DateTimeFormats.timeBetween(form.startTime, form.endTime)}`
    }

    const penaltyHours = penaltyTime.split(':')[0]
    const penaltyMinutes = penaltyTime.split(':')[1]

    const timeWorked = DateTimeFormats.timeBetween(form.startTime, form.endTime, { format: 'short' })
    const creditedTime = DateTimeFormats.timeBetween(penaltyTime, timeWorked, { format: 'short' })
    const creditedHours = creditedTime.split(':')[0]
    const creditedMinutes = creditedTime.split(':')[1]

    const penaltyTimeInHumanReadableFormat = DateTimeFormats.hoursAndMinutesToHumanReadable(
      Number(penaltyHours),
      Number(penaltyMinutes),
    )

    return `${penaltyTimeInHumanReadableFormat}<br>Total hours credited: ${DateTimeFormats.hoursAndMinutesToHumanReadable(Number(creditedHours), Number(creditedMinutes))}`
  }

  private formItems(form: AppointmentOutcomeForm, appointment: AppointmentOrSession): GovUkSummaryListItem[] {
    const items = [
      ...this.buildOffenderItem(form, appointment),
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
              href: this.changePath(appointment, 'choose-supervisor'),
              text: 'Change',
              visuallyHiddenText: 'supervising officer',
            },
          ],
        },
      },
      {
        key: {
          text: 'Attendance',
        },
        value: {
          text: form.contactOutcome?.name,
        },
        actions: {
          items: [
            {
              href: this.changePath(appointment, 'attendance-outcome'),
              text: 'Change',
              visuallyHiddenText: 'attendance outcome',
            },
          ],
        },
      },
      ...NotesUtils.checkYourAnswersRows(
        form,
        this.changePath(appointment, 'attendance-outcome'),
        this.isSingleAppointment(appointment) ? appointment : undefined,
      ),
    ]

    if (form.contactOutcome.attended || this.isSingleAppointment(appointment)) {
      items.push({
        key: {
          text: 'Start and end time',
        },
        value: {
          html: this.getStartAndEndTime(form),
        },
        actions: {
          items: form.contactOutcome.attended
            ? [
                {
                  href: this.changePath(appointment, 'log-hours'),
                  text: 'Change',
                  visuallyHiddenText: 'start and end time',
                },
              ]
            : [],
        },
      })
    }

    if (form.contactOutcome.attended) {
      items.push(
        ...[
          {
            key: {
              text: 'Penalty hours',
            },
            value: {
              html: this.getCreditedHours(form),
            },
            actions: {
              items: [
                {
                  href: this.changePath(appointment, 'log-hours'),
                  text: 'Change',
                  visuallyHiddenText: 'penalty hours',
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
                  href: this.changePath(appointment, 'log-compliance'),
                  text: 'Change',
                  visuallyHiddenText: 'compliance',
                },
              ],
            },
          },
        ],
      )
    }

    return items
  }

  buildOffenderItem(
    form: AppointmentOutcomeForm,
    appointmentOrSession: AppointmentOrSession,
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
              href: this.changePath(appointmentOrSession, 'select-people'),
              text: 'Change',
              visuallyHiddenText: 'penalty hours',
            },
          ],
        },
      },
    ]
  }

  private changePath(appointmentOrSession: AppointmentOrSession, page: AppointmentFormPage) {
    if ('deliusEventNumber' in appointmentOrSession) {
      return this.pathWithFormId(
        paths.appointments.update({
          projectCode: appointmentOrSession.projectCode,
          appointmentId: appointmentOrSession.id.toString(),
          page,
        }),
      )
    }

    return this.pathWithFormId(
      paths.sessions.update({
        projectCode: appointmentOrSession.projectCode,
        date: appointmentOrSession.date,
        page,
      }),
    )
  }

  getComplianceAnswers(form: AppointmentOutcomeForm): string {
    let answers = ''

    if (typeof form.attendanceData?.hiVisWorn === 'boolean') {
      answers += `Wore hi-vis - ${form.attendanceData.hiVisWorn ? 'Yes' : 'No'}<br>`
    }

    if (typeof form.attendanceData?.workedIntensively === 'boolean') {
      answers += `Working intensively - ${form.attendanceData.workedIntensively ? 'Yes' : 'No'}<br>`
    }

    if (form.attendanceData?.workQuality) {
      answers += `Work quality - ${AppointmentUtils.formatComplianceRatings(form.attendanceData.workQuality)}<br>`
    }

    if (form.attendanceData?.behaviour) {
      answers += `Behaviour - ${AppointmentUtils.formatComplianceRatings(form.attendanceData.behaviour)}`
    }

    return answers
  }
}
