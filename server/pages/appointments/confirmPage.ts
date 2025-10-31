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
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  submittedItems: GovUkSummaryListItem[]
}

export default class ConfirmPage extends BaseAppointmentUpdatePage {
  constructor(query: AppointmentUpdateQuery) {
    super(query)
  }

  viewData(appointment: AppointmentDto, form: AppointmentOutcomeForm): ViewData {
    return {
      ...this.commonViewData(appointment),
      submittedItems: this.formItems(form),
    }
  }

  protected nextPath(appointment: AppointmentDto): string {
    return SessionUtils.getSessionPath(appointment)
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.logCompliance({ appointmentId: appointment.id.toString() })
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

  private formItems(form: AppointmentOutcomeForm): GovUkSummaryListItem[] {
    const items = [
      {
        key: {
          text: 'Supervising officer',
        },
        value: {
          text: form.supervisorOfficerCode,
        },
      },
      {
        key: {
          text: 'Attendance',
        },
        value: {
          text: form.contactOutcome?.name,
        },
      },
      {
        key: {
          text: 'Start and end time',
        },
        value: {
          html: this.getStartAndEndTime(form),
        },
      },
      {
        key: {
          text: 'Penalty hours',
        },
        value: {
          html: this.getCreditedHours(form),
        },
      },
      {
        key: {
          text: 'Compliance',
        },
        value: {
          html: form.attendanceData?.hiVisWorn.toString(),
        },
      },
    ]

    if (form.enforcement) {
      items.push(
        ...[
          {
            key: {
              text: 'Enforcement',
            },
            value: { text: form.enforcement.action.name },
          },
          {
            key: {
              text: 'Respond by',
            },
            value: { text: DateTimeFormats.isoDateToUIDate(form.enforcement.respondBy, { format: 'medium' }) },
          },
        ],
      )
    }

    return items
  }
}
