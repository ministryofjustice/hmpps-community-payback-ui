import { AppointmentOutcomeForm, AppointmentUpdateQuery, ValidationErrors } from '../../@types/user-defined'
import { AppointmentDto, ContactOutcomeDto, FormKeyDto } from '../../@types/shared'
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

  form({ data, key }: { data: AppointmentOutcomeForm; key: FormKeyDto }): AppointmentOutcomeForm {
    this.formId = key.id

    return {
      ...data,
      contactOutcomeId: this.query.attendanceOutcome.toString(),
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
      value: outcome.id,
      checked: outcome.id === appointment.contactOutcomeId,
    }))
  }
}
