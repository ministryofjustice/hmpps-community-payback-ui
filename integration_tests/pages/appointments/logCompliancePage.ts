import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Page from '../page'
import Offender from '../../../server/models/offender'
import { pathWithQuery } from '../../../server/utils/utils'

export default class LogCompliancePage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): LogCompliancePage {
    const path = pathWithQuery(
      paths.appointments.logCompliance({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
      {
        form: '123',
      },
    )
    cy.visit(path)

    return new LogCompliancePage(appointment)
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('hiVis', 'yes')
    this.checkRadioByNameAndValue('workedIntensively', 'no')
    this.checkRadioByNameAndValue('workQuality', 'GOOD')
    this.checkRadioByNameAndValue('behaviour', 'UNSATISFACTORY')
    this.getTextInputByIdAndEnterDetails('notes', 'Attendance notes')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('have.text', 'Log compliance')
  }
}
