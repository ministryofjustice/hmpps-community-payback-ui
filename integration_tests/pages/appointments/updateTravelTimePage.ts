import { AppointmentDto, ProjectDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class UpdateTravelTimePage extends Page {
  readonly timeInput = new HoursMinutesInputComponent()

  readonly appointmentDetails = new SummaryListComponent('Appointment details')

  constructor(private readonly appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto, taskId: string = '1'): UpdateTravelTimePage {
    const path = paths.appointments.travelTime.update({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
      taskId,
    })

    cy.visit(path)

    return new UpdateTravelTimePage(appointment)
  }

  clickNotEligible() {
    cy.get('button').contains('Not eligible').click()
  }

  override clickSubmit() {
    cy.get('button').contains('Credit travel time').click()
  }

  override shouldShowErrorSummary(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }

  shouldShowAppointmentDetails(contactOutcome: string, project: ProjectDto) {
    this.appointmentDetails
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.appointment.date))

    this.appointmentDetails.getValueWithLabel('Contact outcome').should('contain.text', contactOutcome)

    this.appointmentDetails
      .getValueWithLabel('Actual start time')
      .should('contain.text', DateTimeFormats.stripTime(this.appointment.startTime))

    this.appointmentDetails
      .getValueWithLabel('Actual end time')
      .should('contain.text', DateTimeFormats.stripTime(this.appointment.endTime))

    this.appointmentDetails.getValueWithLabel('Project').should('contain.text', project.projectName)
    this.appointmentDetails.getValueWithLabel('Project type').should('contain.text', project.projectType.name)
  }
}
