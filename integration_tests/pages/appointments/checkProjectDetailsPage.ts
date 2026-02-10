import { AppointmentDto, ProjectDto } from '../../../server/@types/shared'
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

  private readonly project: ProjectDto

  constructor(appointment: AppointmentDto, project: ProjectDto) {
    const offender = new Offender(appointment.offender)

    super(offender.name)
    this.appointment = appointment
    this.project = project
    this.projectDetails = new SummaryListComponent()
    this.supervisorInput = new SelectInput('supervisor')
  }

  static visit(appointment: AppointmentDto, project: ProjectDto): CheckProjectDetailsPage {
    const path = paths.appointments.projectDetails({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
    cy.visit(path)

    return new CheckProjectDetailsPage(appointment, project)
  }

  shouldContainProjectDetails() {
    this.projectDetails.getValueWithLabel('Project').should('contain.text', this.project.projectName)
    this.projectDetails.getValueWithLabel('Project type').should('contain.text', this.project.projectType.name)
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
