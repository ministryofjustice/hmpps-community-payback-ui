import { AppointmentDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkRadioOption,
  GovUkSummaryListItem,
  YesOrNo,
} from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import NotesUtils from '../../utils/notesUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData extends AppointmentUpdatePageViewData {
  alertPractitionerItems: GovUkRadioOption[]
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

  viewData(appointment: AppointmentDto, form: AppointmentOutcomeForm): ViewData {
    const showWillAlertPractitionerMessage = form.contactOutcome?.willAlertEnforcementDiary ?? false
    this.form = form

    return {
      ...this.commonViewData(appointment),
      submittedItems: this.formItems(form, appointment),
      showWillAlertPractitionerMessage,
      alertPractitionerItems: GovUkRadioGroup.yesNoItems({
        checkedValue: GovUkRadioGroup.determineCheckedValue(appointment.alertActive),
      }),
      alertDiaryText: `Would you ${showWillAlertPractitionerMessage ? 'also' : ''} like this to be sent to the alert diary?`,
    }
  }

  get isAlertSelected(): boolean | null {
    return GovUkRadioGroup.nullableValueFromYesOrNoItem(this.query.alertPractitioner)
  }

  protected nextPath(_projectCode: string, _appointmentId: string): string {
    throw new Error('Method not implemented')
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

  private formItems(form: AppointmentOutcomeForm, appointment: AppointmentDto): GovUkSummaryListItem[] {
    const appointmentId = appointment.id.toString()
    const { projectCode } = appointment

    const items = [
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
              href: this.pathWithFormId(paths.appointments.chooseSupervisor({ projectCode, appointmentId })),
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
              href: this.pathWithFormId(paths.appointments.attendanceOutcome({ projectCode, appointmentId })),
              text: 'Change',
              visuallyHiddenText: 'attendance outcome',
            },
          ],
        },
      },
      ...NotesUtils.checkYourAnswersRows(
        form,
        this.pathWithFormId(paths.appointments.attendanceOutcome({ projectCode, appointmentId })),
        appointment,
      ),
      {
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
                  href: this.pathWithFormId(paths.appointments.logHours({ projectCode, appointmentId })),
                  text: 'Change',
                  visuallyHiddenText: 'start and end time',
                },
              ]
            : [],
        },
      },
    ]

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
                  href: this.pathWithFormId(paths.appointments.logHours({ projectCode, appointmentId })),
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
                  href: this.pathWithFormId(paths.appointments.logCompliance({ projectCode, appointmentId })),
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
