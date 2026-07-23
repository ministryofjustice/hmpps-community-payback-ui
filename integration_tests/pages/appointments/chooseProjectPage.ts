import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'
import ProjectQuestionsComponent from '../components/projectQuestionsComponent'

export default class ChooseProjectPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'choose-project'

  readonly form: ProjectQuestionsComponent

  constructor(context: AppointmentTitleContext) {
    super(context)
    this.form = new ProjectQuestionsComponent()
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Add project details')
  }
}
