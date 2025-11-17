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

  constructor(query: AttendanceOutcomeQuery) {
    super(query)
    this.query = query
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

  viewData(appointment: AppointmentDto, contactOutcomes: ContactOutcomeDto[]) {
    return {
      ...this.commonViewData(appointment),
      items: this.items(contactOutcomes, appointment),
    }
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.projectDetails({ appointmentId: appointment.id.toString() })
  }

  protected nextPath(appointmentId: string): string {
    return paths.appointments.logHours({ appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.attendanceOutcome({ appointmentId: appointment.id.toString() })
  }

  private items(contactOutcomes: ContactOutcomeDto[], appointment: AppointmentDto): { text: string; value: string }[] {
    return contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      checked: outcome.code === appointment.contactOutcomeCode,
    }))
  }
}
