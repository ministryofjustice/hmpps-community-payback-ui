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
  penaltyTimeHours?: string
  penaltyTimeMinutes?: string
}

interface LogHoursBody {
  startTime: string
  endTime: string
  penaltyTimeHours?: string
  penaltyTimeMinutes?: string
}

export interface LogHoursQuery extends AppointmentUpdateQuery {
  startTime?: string
  endTime?: string
  penaltyTimeHours?: string
  penaltyTimeMinutes?: string
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
        penaltyMinutes: DateTimeFormats.hoursAndMinutesToMinutes(
          this.query.penaltyTimeHours,
          this.query.penaltyTimeMinutes,
        ),
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

    const hasHours = !!this.query.penaltyTimeHours
    const hasMinutes = !!this.query.penaltyTimeMinutes
    const hasEither = hasHours || hasMinutes
    const hasBoth = hasHours && hasMinutes

    if (hasEither && !hasBoth) {
      if (!hasHours) {
        this.validationErrors.penaltyTimeHours = { text: 'Enter hours for penalty hours' }
      }
      if (!hasMinutes) {
        this.validationErrors.penaltyTimeMinutes = { text: 'Enter minutes for penalty hours' }
      }
      return
    }

    if (hasBoth) {
      const hours = parseInt(this.query.penaltyTimeHours as string, 10)
      const minutes = parseInt(this.query.penaltyTimeMinutes as string, 10)

      if (Number.isNaN(hours) || hours < 0) {
        this.validationErrors.penaltyTimeHours = { text: 'Enter valid hours for penalty hours, for example 2' }
      }

      if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
        this.validationErrors.penaltyTimeMinutes = { text: 'Enter valid minutes for penalty hours, for example 30' }
      }
    }

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }

  viewData(appointment: AppointmentDto, form: AppointmentOutcomeForm): ViewData {
    const isAttended = Boolean(form.contactOutcome?.attended)

    const formPenaltyMinutes = form.attendanceData?.penaltyMinutes
    const penaltyMinutes =
      formPenaltyMinutes !== undefined ? formPenaltyMinutes : appointment.attendanceData?.penaltyMinutes
    const hasPenaltyMinutes = typeof penaltyMinutes === 'number' && penaltyMinutes >= 0

    const viewData = {
      ...this.commonViewData(appointment),
      startTime: DateTimeFormats.stripTime(appointment.startTime),
      endTime: DateTimeFormats.stripTime(appointment.endTime),
      showPenaltyHours: isAttended,
    }

    if (isAttended) {
      const penaltyTimeParts = hasPenaltyMinutes
        ? DateTimeFormats.totalMinutesToHoursAndMinutesParts(penaltyMinutes)
        : null

      return {
        ...viewData,
        penaltyTimeHours: penaltyTimeParts?.hours ?? null,
        penaltyTimeMinutes: penaltyTimeParts?.minutes ?? null,
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
