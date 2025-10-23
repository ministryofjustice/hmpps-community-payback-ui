import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'
import { AppointmentDto } from '../../../server/@types/shared'

export default class AttendanceOutcomePage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): AttendanceOutcomePage {
    const path = paths.appointments.attendanceOutcome({ appointmentId: appointment.id.toString() })
    cy.visit(path)

    return new AttendanceOutcomePage(appointment)
  }

  selectOutcome(contactOutcomeId: string) {
    this.checkRadioByNameAndValue('attendanceOutcome', contactOutcomeId)
  }
}
