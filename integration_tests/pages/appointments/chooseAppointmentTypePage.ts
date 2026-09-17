import { OffenderDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import Page from '../page'

export default class ChooseAppointmentTypePage extends Page {
  readonly options: RadioOrCheckboxGroupComponent

  constructor(offender: OffenderDto) {
    super(new Offender(offender).name)
    this.options = new RadioOrCheckboxGroupComponent('appointmentType')
  }

  static visit(offender: OffenderDto, deliusEventNumber: string): ChooseAppointmentTypePage {
    return this.visitAndCheck(paths.people.createAppointment({ crn: offender.crn, deliusEventNumber }), offender)
  }

  completeForm() {
    this.options.checkOptionWithValue('GROUP')
  }

  shouldShowValidationError() {
    this.shouldShowErrorSummary('appointmentType', 'Select type of appointment')
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Select type of appointment')
  }
}
