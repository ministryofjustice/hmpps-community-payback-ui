import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SelectInput from '../components/selectComponent'
import SummaryListComponent from '../components/summaryListComponent'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Page from '../page'
import Offender from '../../../server/models/offender'

export default class CheckProjectDetailsPage extends Page {
  private readonly projectDetails: SummaryListComponent

  readonly supervisorInput: SelectInput

  readonly appointment: AppointmentDto

  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)

    super(offender.name)
    this.appointment = appointment
    this.projectDetails = new SummaryListComponent()
    this.supervisorInput = new SelectInput('supervisor')
  }

  static visit(appointment: AppointmentDto): CheckProjectDetailsPage {
    const path = paths.appointments.projectDetails({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
    cy.visit(path)

    return new CheckProjectDetailsPage(appointment)
  }

  shouldContainProjectDetails() {
    this.projectDetails.getValueWithLabel('Project').should('contain.text', this.appointment.projectName)
    this.projectDetails.getValueWithLabel('Project type').should('contain.text', this.appointment.projectTypeName)
    this.projectDetails.getValueWithLabel('Supervising team').should('contain.text', this.appointment.supervisingTeam)
    this.projectDetails
      .getValueWithLabel('Date and time')
      .should(
        'contain.text',
        DateTimeFormats.dateAndTimePeriod(this.appointment.date, this.appointment.startTime, this.appointment.endTime),
      )
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('have.text', 'Check project details')
  }
}
