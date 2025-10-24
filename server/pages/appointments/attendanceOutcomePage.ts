import { ParsedQs } from 'qs'
import { ValidationErrors } from '../../@types/user-defined'
import { AppointmentDto, ContactOutcomeDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'

export type AttendanceOutcomeBody = {
  attendanceOutcome: string
}

export default class AttendanceOutcomePage {
  private query: ParsedQs

  constructor(query: ParsedQs) {
    this.query = query
  }

  validationErrors() {
    const validationErrors: ValidationErrors<AttendanceOutcomeBody> = {}

    if (!this.query.attendanceOutcome) {
      validationErrors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    return validationErrors
  }

  viewData(appointment: AppointmentDto, contactOutcomes: ContactOutcomeDto[]) {
    const appointmentId = appointment.id.toString()

    return {
      offender: new Offender(appointment.offender),
      items: this.items(contactOutcomes),
      updatePath: paths.appointments.attendanceOutcome({ appointmentId }),
      backLink: paths.appointments.projectDetails({ appointmentId }),
    }
  }

  private items(contactOutcomes: ContactOutcomeDto[]): { text: string; value: string }[] {
    return contactOutcomes.map(outcome => ({ text: outcome.name, value: outcome.id }))
  }
}
