import SelectInput from '../components/selectComponent'
import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class ChooseRegionPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'region'

  readonly regionInput: SelectInput

  constructor(context: AppointmentTitleContext) {
    super(context)
    this.regionInput = new SelectInput('provider')
  }

  protected override customCheckOnPage(): void {
    cy.get('label').should('contain.text', 'Choose region')
  }
}
