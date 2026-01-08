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

  getForm(data: AppointmentOutcomeForm): AppointmentOutcomeForm {
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

    if (!this.validationErrors.startTime && !this.validationErrors.endTime) {
      if (!DateTimeFormats.timesAreOrdered(this.query.startTime, this.query.endTime)) {
        this.validationErrors.startTime = { text: 'Start time should be before end time' }
      }
    }

    if (this.query.penaltyHours && !DateTimeFormats.isValidTime(this.query.penaltyHours as string)) {
      this.validationErrors.penaltyHours = { text: 'Enter a valid time for penalty hours, for example 01:00' }
    }

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }

  viewData(appointment: AppointmentDto, form: AppointmentOutcomeForm): ViewData {
    const isAttended = Boolean(form.contactOutcome?.attended)

    const viewData = {
      ...this.commonViewData(appointment),
      startTime: DateTimeFormats.stripTime(appointment.startTime),
      endTime: DateTimeFormats.stripTime(appointment.endTime),
      showPenaltyHours: isAttended,
    }

    if (isAttended) {
      return {
        ...viewData,
        penaltyHours: appointment.attendanceData?.penaltyTime
          ? DateTimeFormats.stripTime(appointment.attendanceData.penaltyTime)
          : null,
      }
    }

    return viewData
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.attendanceOutcome({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
  }

  protected nextPath(projectCode: string, appointmentId: string): string {
    if (this.form.contactOutcome && this.form.contactOutcome.attended) {
      return paths.appointments.logCompliance({ projectCode, appointmentId })
    }

    return paths.appointments.confirm({ projectCode, appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.logHours({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
  }
}
