import { AppointmentDto } from '../../../server/@types/shared/models/AppointmentDto'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import { pathWithQuery } from '../../../server/utils/utils'
import DateComponent from '../components/dateComponent'
import Page from '../page'

export default class EnforcementPage extends Page {
  respondByInput: DateComponent

  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
    this.respondByInput = new DateComponent('respondBy')
  }

  static visit(appointment: AppointmentDto): EnforcementPage {
    const path = pathWithQuery(paths.appointments.enforcement({ appointmentId: appointment.id.toString() }), {
      form: '123',
    })
    cy.visit(path)

    return new EnforcementPage(appointment)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('have.text', 'Confirm enforcement')
  }

  shouldShowQuestions() {
    const date = DateTimeFormats.getTodaysDatePlusDays(7)
    this.respondByInput.shouldHaveValue(date)
  }
}
