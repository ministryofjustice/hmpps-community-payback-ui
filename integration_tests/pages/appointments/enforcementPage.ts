import { AppointmentDto } from '../../../server/@types/shared/models/AppointmentDto'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import { pathWithQuery } from '../../../server/utils/utils'
import Page from '../page'

export default class EnforcementPage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): EnforcementPage {
    const path = pathWithQuery(paths.appointments.confirm({ appointmentId: appointment.id.toString() }), {
      form: '123',
    })
    cy.visit(path)

    return new EnforcementPage(appointment)
  }

  shouldShowQuestions() {
    cy.get('h2').should('have.text', 'Log enforcement')
    this.getTextInputById('enforcement').should('be.visible')
  }
}
