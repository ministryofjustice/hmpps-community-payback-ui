import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'

export default class LogHoursPage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): LogHoursPage {
    const path = paths.appointments.logHours({ appointmentId: appointment.id.toString() })
    cy.visit(path)

    return new LogHoursPage(appointment)
  }

  enterStartTime(time: string): void {
    this.getTextInputByIdAndEnterDetails('startTime', time)
  }

  enterEndTime(time: string): void {
    this.getTextInputByIdAndEnterDetails('endTime', time)
  }
}
