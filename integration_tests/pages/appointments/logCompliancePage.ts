import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Page from '../page'
import Offender from '../../../server/models/offender'

export default class LogCompliancePage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): LogCompliancePage {
    const path = paths.appointments.logCompliance({ appointmentId: appointment.id.toString() })
    cy.visit(path)

    return new LogCompliancePage(appointment)
  }
}
