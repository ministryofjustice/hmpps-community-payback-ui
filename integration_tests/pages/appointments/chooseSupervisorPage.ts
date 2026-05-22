import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SelectInput from '../components/selectComponent'
import Page from '../page'
import Offender from '../../../server/models/offender'
import { pathWithQuery } from '../../../server/utils/utils'

export default class ChooseSupervisorPage extends Page {
  readonly teamInput: SelectInput

  readonly supervisorInput: SelectInput

  readonly appointment: AppointmentDto

  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)

    super(offender.name)
    this.appointment = appointment
    this.teamInput = new SelectInput('team')
    this.supervisorInput = new SelectInput('supervisor')
  }

  static visit(appointment: AppointmentDto, team?: string): ChooseSupervisorPage {
    const query = { form: '123' } as { form: string; team?: string }
    if (team) {
      query.team = team
    }

    const path = pathWithQuery(
      paths.appointments.chooseSupervisor({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
      query,
    )

    cy.visit(path)

    return new ChooseSupervisorPage(appointment)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Add supervisor details')
  }
}
