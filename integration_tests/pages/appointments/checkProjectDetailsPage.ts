import { AppointmentDto, OffenderFullDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import { mockAppointment } from '../../mockApis/appointments'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class CheckProjectDetailsPage extends Page {
  private readonly projectDetails: SummaryListComponent

  constructor(appointment: AppointmentDto = mockAppointment) {
    const offender = appointment.offender as OffenderFullDto

    super(`${offender.forename} ${offender.surname}`)
    this.projectDetails = new SummaryListComponent()
  }

  static visit(appointment: AppointmentDto = mockAppointment): CheckProjectDetailsPage {
    const path = paths.appointments.projectDetails({ appointmentId: '1001' })
    cy.visit(path)

    const page = new CheckProjectDetailsPage(appointment)
    page.checkOnPage()
    return page
  }

  shouldContainProjectDetails() {
    this.projectDetails.getValueWithLabel('Project').should('contain.text', mockAppointment.projectName)
    this.projectDetails.getValueWithLabel('Project type').should('contain.text', mockAppointment.projectTypeName)
    this.projectDetails.getValueWithLabel('Supervising team').should('contain.text', mockAppointment.supervisingTeam)
    this.projectDetails
      .getValueWithLabel('Date and time')
      .should('contain.text', 'Thursday 2 January 2025, 11:00 - 12:00')
  }
}
