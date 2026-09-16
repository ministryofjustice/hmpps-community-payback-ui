import { OffenderDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import Page from '../page'

export default class ChooseAppointmentTypePage extends Page {
  readonly options: RadioOrCheckboxGroupComponent

  constructor(offender: OffenderDto) {
    super(new Offender(offender).name)
    this.options = new RadioOrCheckboxGroupComponent('appointmentType')
  }

  completeForm(appointmentType: string) {
    this.options.checkOptionWithValue(appointmentType)
  }

  shouldNotShowOutcome(contactOutcomeCode: string) {
    this.options.shouldNotHaveVisibleOptionWithValue(contactOutcomeCode)
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Select type of appointment')
  }
}
