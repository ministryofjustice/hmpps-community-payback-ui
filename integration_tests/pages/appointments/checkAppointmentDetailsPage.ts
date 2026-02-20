import { AppointmentDto, ProjectDto, ProviderSummaryDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SelectInput from '../components/selectComponent'
import SummaryListComponent from '../components/summaryListComponent'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Page from '../page'
import Offender from '../../../server/models/offender'
import LocationUtils from '../../../server/utils/locationUtils'
import { yesNoDisplayValue } from '../../../server/utils/utils'

export default class CheckAppointmentDetailsPage extends Page {
  private readonly projectDetails: SummaryListComponent

  private readonly appointmentDetails: SummaryListComponent

  readonly supervisorInput: SelectInput

  readonly appointment: AppointmentDto

  private readonly project: ProjectDto

  private readonly provider: ProviderSummaryDto

  constructor(appointment: AppointmentDto, project: ProjectDto, provider: ProviderSummaryDto) {
    const offender = new Offender(appointment.offender)

    super(offender.name)
    this.appointment = appointment
    this.project = project
    this.projectDetails = new SummaryListComponent()
    this.appointmentDetails = new SummaryListComponent()
    this.supervisorInput = new SelectInput('supervisor')
    this.provider = provider
  }

  static visit(
    appointment: AppointmentDto,
    project: ProjectDto,
    provider: ProviderSummaryDto,
  ): CheckAppointmentDetailsPage {
    const path = paths.appointments.appointmentDetails({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
    cy.visit(path)

    return new CheckAppointmentDetailsPage(appointment, project, provider)
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

  shouldContainAppointmentDetails(): void {
    this.appointmentDetails.getValueWithLabel('Provider').should('contain.text', this.provider.name)
    this.appointmentDetails
      .getValueWithLabel('Pick up time')
      .should('contain.text', DateTimeFormats.stripTime(this.appointment.pickUpData.time))
    this.appointmentDetails
      .getValueWithLabel('Pick up place')
      .should(
        'contain.text',
        LocationUtils.locationToString(this.appointment.pickUpData.location, { withLineBreaks: false }),
      )
    this.appointmentDetails.getValueWithLabel('Notes').should('contain.text', this.appointment.notes)

    this.appointmentDetails
      .getValueWithLabel('Sensitive')
      .should('contain.text', yesNoDisplayValue(this.appointment.sensitive))
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').eq(1).should('contain.text', 'Project details')
    cy.get('h2').eq(2).should('contain.text', 'Appointment details')
  }
}
