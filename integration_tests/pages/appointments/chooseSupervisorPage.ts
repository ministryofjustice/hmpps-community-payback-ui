import SelectInput from '../components/selectComponent'
import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class ChooseSupervisorPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'choose-supervisor'

  readonly teamInput: SelectInput

  readonly supervisorInput: SelectInput

  constructor(context: AppointmentTitleContext) {
    super(context)
    this.teamInput = new SelectInput('team')
    this.supervisorInput = new SelectInput('supervisor')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Add supervisor details')
  }

  selectTeam(teamCode: string) {
    this.teamInput.select(teamCode)
    cy.get('button').contains('Select team').click()
  }
}
