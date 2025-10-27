import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'

export default class ConfirmDetailsPage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): ConfirmDetailsPage {
    const path = paths.appointments.logCompliance({ appointmentId: appointment.id.toString() })
    cy.visit(path)

    return new ConfirmDetailsPage(appointment)
  }
}
