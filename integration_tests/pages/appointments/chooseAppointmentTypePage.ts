import { OffenderDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import Page from '../page'

export default class ChooseAppointmentTypePage extends Page {
  constructor(offender: OffenderDto) {
    super(new Offender(offender).name)
  }

  static visit(offender: OffenderDto, deliusEventNumber: string): ChooseAppointmentTypePage {
    return this.visitAndCheck(paths.people.createAppointment({ crn: offender.crn, deliusEventNumber }), offender)
  }

  shouldShowValidationError() {
    this.shouldShowErrorSummary('appointmentType', 'Select type of appointment')
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Select type of appointment')
  }
}
