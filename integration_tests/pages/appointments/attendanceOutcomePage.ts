import paths from '../../../server/paths'
import { mockOffender } from '../../mockApis/appointments'
import Page from '../page'

export default class AttendanceOutcomePage extends Page {
  constructor() {
    super(`${mockOffender.forename} ${mockOffender.surname}`)
  }

  static visit(): AttendanceOutcomePage {
    const path = paths.appointments.attendanceOutcome({ appointmentId: '1001' })
    cy.visit(path)

    return Page.verifyOnPage(AttendanceOutcomePage)
  }

  selectOutcome(contactOutcomeId: string) {
    this.checkRadioByNameAndValue('attendanceOutcome', contactOutcomeId)
  }
}
