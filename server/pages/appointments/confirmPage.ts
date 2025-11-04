import { AppointmentDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSummaryListItem,
} from '../../@types/user-defined'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'
import { properCase } from '../../utils/utils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  submittedItems: GovUkSummaryListItem[]
}

export default class ConfirmPage extends BaseAppointmentUpdatePage {
  constructor(query: AppointmentUpdateQuery) {
    super(query)
  }

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }

  viewData(appointment: AppointmentDto, form: AppointmentOutcomeForm): ViewData {
    this.form = form

    return {
      ...this.commonViewData(appointment),
      submittedItems: this.formItems(form, appointment),
    }
  }

  protected nextPath(appointment: AppointmentDto): string {
    return SessionUtils.getSessionPath(appointment)
  }

  protected backPath(appointment: AppointmentDto): string {
    const appointmentId = appointment.id.toString()
    if (this.form && this.form.contactOutcome?.enforceable) {
      return paths.appointments.enforcement({ appointmentId })
    }

    if (this.form && this.form.contactOutcome?.attended) {
      return paths.appointments.logCompliance({ appointmentId })
    }

    return paths.appointments.logHours({ appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.confirm({ appointmentId: appointment.id.toString() })
  }

  private getStartAndEndTime(form: AppointmentOutcomeForm) {
    const { startTime, endTime } = form
    return `${startTime} - ${endTime}<br>Total hours worked: ${DateTimeFormats.timeBetween(startTime, endTime)}`
  }

  private getCreditedHours(form: AppointmentOutcomeForm) {
    const penaltyTime = form.attendanceData?.penaltyTime

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

    const items = [
      {
        key: {
          text: 'Supervising officer',
        },
        value: {
          text: form.supervisorOfficerCode,
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(paths.appointments.projectDetails({ appointmentId })),
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
              href: this.pathWithFormId(paths.appointments.attendanceOutcome({ appointmentId })),
              text: 'Change',
              visuallyHiddenText: 'attendance outcome',
            },
          ],
        },
      },
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
              href: this.pathWithFormId(paths.appointments.logHours({ appointmentId })),
              text: 'Change',
              visuallyHiddenText: 'start and end time',
            },
          ],
        },
      },
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
              href: this.pathWithFormId(paths.appointments.logHours({ appointmentId })),
              text: 'Change',
              visuallyHiddenText: 'penalty hours',
            },
          ],
        },
      },
    ]

    if (form.contactOutcome.attended) {
      items.push({
        key: {
          text: 'Compliance',
        },
        value: {
          html: this.getComplianceAnswers(form),
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(paths.appointments.logCompliance({ appointmentId })),
              text: 'Change',
              visuallyHiddenText: 'compliance',
            },
          ],
        },
      })
    }

    if (form.contactOutcome.enforceable && form.enforcement) {
      items.push(
        ...[
          {
            key: {
              text: 'Enforcement',
            },
            value: { text: form.enforcement.action.name },
            actions: {
              items: [
                {
                  href: this.pathWithFormId(paths.appointments.enforcement({ appointmentId })),
                  text: 'Change',
                  visuallyHiddenText: 'enforcement action',
                },
              ],
            },
          },
          {
            key: {
              text: 'Respond by',
            },
            value: { text: DateTimeFormats.isoDateToUIDate(form.enforcement.respondBy, { format: 'medium' }) },
            actions: {
              items: [
                {
                  href: this.pathWithFormId(paths.appointments.enforcement({ appointmentId })),
                  text: 'Change',
                  visuallyHiddenText: 'respond by date',
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
      answers += `High-vis - ${form.attendanceData.hiVisWorn ? 'Yes' : 'No'}<br>`
    } else if (form.attendanceData?.hiVisWorn === undefined || form.attendanceData?.hiVisWorn === null) {
      answers += `High-vis - Not applicable<br>`
    }

    if (typeof form.attendanceData?.workedIntensively === 'boolean') {
      answers += `Worked intensively - ${form.attendanceData.workedIntensively ? 'Yes' : 'No'}<br>`
    }

    if (form.attendanceData?.workQuality) {
      answers += `Work quality - ${this.formatComplianceRatings(form.attendanceData.workQuality)}<br>`
    }

    if (form.attendanceData?.behaviour) {
      answers += `Behaviour - ${this.formatComplianceRatings(form.attendanceData.behaviour)}`
    }

    return answers
  }

  private formatComplianceRatings(rating: string): string {
    const ratingWithProperCasing = properCase(rating)
    const ratingSubstrings = ratingWithProperCasing.split('_')
    return ratingSubstrings.length > 1 ? `${ratingSubstrings[0]} ${ratingSubstrings[1]}` : ratingSubstrings[0]
  }
}
