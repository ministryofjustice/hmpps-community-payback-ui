import paths from '../../../server/paths'
import { mockOffender } from '../../mockApis/appointments'
import Page from '../page'

export default class LogHoursPage extends Page {
  constructor() {
    super(`${mockOffender.forename} ${mockOffender.surname}`)
  }

  static visit(): LogHoursPage {
    const path = paths.appointments.logHours({ appointmentId: '1001' })
    cy.visit(path)

    return Page.verifyOnPage(LogHoursPage)
  }

  enterStartTime(time: string): void {
    this.getTextInputByIdAndEnterDetails('startTime', time)
  }

  enterEndTime(time: string): void {
    this.getTextInputByIdAndEnterDetails('endTime', time)
  }
}
