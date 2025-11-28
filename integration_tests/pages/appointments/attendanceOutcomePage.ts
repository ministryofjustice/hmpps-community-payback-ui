import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'
import { AppointmentDto } from '../../../server/@types/shared'
import { pathWithQuery } from '../../../server/utils/utils'

export default class AttendanceOutcomePage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): AttendanceOutcomePage {
    const path = pathWithQuery(
      paths.appointments.attendanceOutcome({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
      {
        form: '123',
      },
    )
    cy.visit(path)

    return new AttendanceOutcomePage(appointment)
  }

  selectOutcome(contactOutcomeCode: string) {
    this.checkRadioByNameAndValue('attendanceOutcome', contactOutcomeCode)
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Log attendance')
  }
}
