import { AppointmentDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  ValidationErrors,
} from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  offender: Offender
  startTime: string
  endTime: string
  penaltyHours?: string
}

interface LogHoursBody {
  startTime: string
  endTime: string
  penaltyHours?: string
}

export interface LogHoursQuery extends AppointmentUpdateQuery {
  startTime?: string
  endTime?: string
  penaltyHours?: string
}

export default class LogHoursPage extends BaseAppointmentUpdatePage {
  hasErrors: boolean

  validationErrors: ValidationErrors<LogHoursBody> = {}

  constructor(private readonly query: LogHoursQuery = {}) {
    super(query)
  }

  form(data: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return {
      ...data,
      startTime: this.query.startTime,
      endTime: this.query.endTime,
      attendanceData: {
        ...data.attendanceData,
        penaltyTime: this.query.penaltyHours,
      },
    }
  }

  validate() {
    if (!this.query.startTime) {
      this.validationErrors.startTime = { text: 'Enter a start time' }
    } else if (!DateTimeFormats.isValidTime(this.query.startTime as string)) {
      this.validationErrors.startTime = { text: 'Enter a valid start time, for example 09:00' }
    }

    if (!this.query.endTime) {
      this.validationErrors.endTime = { text: 'Enter an end time' }
    } else if (!DateTimeFormats.isValidTime(this.query.endTime as string)) {
      this.validationErrors.endTime = { text: 'Enter a valid end time, for example 17:00' }
    }

    if (this.query.penaltyHours && !DateTimeFormats.isValidTime(this.query.penaltyHours as string)) {
      this.validationErrors.penaltyHours = { text: 'Enter a valid time for penalty hours, for example 01:00' }
    }

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }

  viewData(appointment: AppointmentDto): ViewData {
    return {
      ...this.commonViewData(appointment),
      startTime: DateTimeFormats.stripTime(appointment.startTime),
      endTime: DateTimeFormats.stripTime(appointment.endTime),
      penaltyHours: appointment.attendanceData?.penaltyTime
        ? DateTimeFormats.stripTime(appointment.attendanceData.penaltyTime)
        : null,
    }
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.attendanceOutcome({ appointmentId: appointment.id.toString() })
  }

  protected nextPath(appointmentId: string): string {
    return paths.appointments.logCompliance({ appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.logHours({ appointmentId: appointment.id.toString() })
  }
}
