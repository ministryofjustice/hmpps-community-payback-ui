import { AppointmentDto } from '../../../server/@types/shared'
import SelectInput from '../components/selectComponent'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class ChooseSupervisorPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'choose-supervisor'

  readonly teamInput: SelectInput

  readonly supervisorInput: SelectInput

  readonly appointment: AppointmentDto

  constructor(appointment: AppointmentDto) {
    super(appointment)
    this.appointment = appointment
    this.teamInput = new SelectInput('team')
    this.supervisorInput = new SelectInput('supervisor')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Add supervisor details')
  }
}
