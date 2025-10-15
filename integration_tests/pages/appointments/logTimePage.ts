import paths from '../../../server/paths'
import { mockOffender } from '../../mockApis/appointments'
import Page from '../page'

export default class LogTimePage extends Page {
  constructor() {
    super(`${mockOffender.forename} ${mockOffender.surname}`)
  }

  static visit(): LogTimePage {
    const path = paths.appointments.logTime({ appointmentId: '1001' })
    cy.visit(path)

    return Page.verifyOnPage(LogTimePage)
  }
}
