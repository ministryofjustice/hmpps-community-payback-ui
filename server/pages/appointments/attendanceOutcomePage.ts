import { AppointmentOutcomeForm, AppointmentUpdateQuery, ValidationErrors } from '../../@types/user-defined'
import { AppointmentDto, ContactOutcomeDto } from '../../@types/shared'
import paths from '../../paths'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

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

    return validationErrors
  }

  viewData() {
    return {
      ...this.commonViewData(this.appointment),
      items: this.items(),
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

  private items(): { text: string; value: string }[] {
    return this.contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      checked: outcome.code === this.appointment.contactOutcomeCode,
    }))
  }
}
