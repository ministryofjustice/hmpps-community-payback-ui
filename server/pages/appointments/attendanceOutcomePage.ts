import { AppointmentOutcomeForm, AppointmentUpdateQuery, ValidationErrors } from '../../@types/user-defined'
import { AppointmentDto, ContactOutcomeDto } from '../../@types/shared'
import paths from '../../paths'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import DateTimeFormats from '../../utils/dateTimeUtils'

export type AttendanceOutcomeBody = {
  attendanceOutcome: string
}

interface AttendanceOutcomeQuery extends AppointmentUpdateQuery {
  attendanceOutcome?: string
}

export default class AttendanceOutcomePage extends BaseAppointmentUpdatePage {
  private query: AttendanceOutcomeQuery

  private appointment: AppointmentDto

  private contactOutcomes: ContactOutcomeDto[]

  constructor({
    query,
    appointment,
    contactOutcomes,
  }: {
    query: AttendanceOutcomeQuery
    appointment: AppointmentDto
    contactOutcomes: ContactOutcomeDto[]
  }) {
    super(query)
    this.query = query
    this.appointment = appointment
    this.contactOutcomes = contactOutcomes
  }

  protected getForm(data: AppointmentOutcomeForm, outcomes: ContactOutcomeDto[]): AppointmentOutcomeForm {
    const contactOutcome = outcomes.find(outcome => outcome.code === this.query.attendanceOutcome)

    return {
      ...data,
      contactOutcome,
    }
  }

  validationErrors() {
    const validationErrors: ValidationErrors<AttendanceOutcomeBody> = {}

    if (!this.query.attendanceOutcome) {
      validationErrors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    if (
      this.outcomeIsAttendedOrEnforceable(this.query.attendanceOutcome) &&
      DateTimeFormats.dateIsInFuture(this.appointment.date)
    ) {
      validationErrors.attendanceOutcome = {
        text: 'The outcome entered must be: acceptable absence',
      }
    }

    return validationErrors
  }

  viewData(form: AppointmentOutcomeForm, hasErrors: boolean = false) {
    return {
      ...this.commonViewData(this.appointment),
      items: this.items(form, hasErrors),
    }
  }

  protected backPath(): string {
    return paths.appointments.projectDetails({
      projectCode: this.appointment.projectCode,
      appointmentId: this.appointment.id.toString(),
    })
  }

  protected nextPath(projectCode: string, appointmentId: string): string {
    return paths.appointments.logHours({ projectCode, appointmentId })
  }

  protected updatePath(): string {
    return paths.appointments.attendanceOutcome({
      projectCode: this.appointment.projectCode,
      appointmentId: this.appointment.id.toString(),
    })
  }

  private items(form: AppointmentOutcomeForm, hasErrors: boolean): { text: string; value: string }[] {
    const code = hasErrors ? this.query.attendanceOutcome : form.contactOutcome?.code
    return this.contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      checked: outcome.code === code,
    }))
  }

  private outcomeIsAttendedOrEnforceable(outcomeCode: string): boolean {
    if (!outcomeCode) return false

    const outcome = this.contactOutcomes.filter(o => o.code === outcomeCode)[0]

    return outcome.attended || outcome.enforceable
  }
}
