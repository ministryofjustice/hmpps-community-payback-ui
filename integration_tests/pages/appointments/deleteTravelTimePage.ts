import { AppointmentDto, ProjectDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class DeleteTravelTimePage extends Page {
  readonly appointmentDetails = new SummaryListComponent('Appointment details')

  readonly travelTimeDetails = new SummaryListComponent('Travel time details')

  constructor(private readonly appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): DeleteTravelTimePage {
    const path = paths.appointments.travelTime.delete({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })

    return this.visitAndCheck(path, appointment)
  }

  clickCancel() {
    cy.get('a').contains('Cancel').click()
  }

  override clickSubmit() {
    cy.get('button').contains('Delete').click()
  }

  override shouldShowErrorSummary(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }

  shouldShowAppointmentDetails(project: ProjectDto) {
    this.appointmentDetails
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.appointment.date))

    this.appointmentDetails.getValueWithLabel('Project').should('contain.text', project.projectName)
    this.appointmentDetails.getValueWithLabel('Project type').should('contain.text', project.projectType.name)
  }

  shouldShowTravelTimeDetails(amount: string) {
    this.travelTimeDetails.getValueWithLabel('Total travel time').should('contain.text', amount)
  }
}
