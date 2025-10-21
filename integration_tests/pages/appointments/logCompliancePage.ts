import paths from '../../../server/paths'
import { mockOffender } from '../../mockApis/appointments'
import Page from '../page'

export default class LogCompliancePage extends Page {
  constructor() {
    super(`${mockOffender.forename} ${mockOffender.surname}`)
  }

  static visit(): LogCompliancePage {
    const path = paths.appointments.logCompliance({ appointmentId: '1001' })
    cy.visit(path)

    return Page.verifyOnPage(LogCompliancePage)
  }
}
