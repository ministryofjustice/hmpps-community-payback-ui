import { AppointmentDto, ProjectDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SelectInput from '../components/selectComponent'
import SummaryListComponent from '../components/summaryListComponent'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Page from '../page'
import Offender from '../../../server/models/offender'
import LocationUtils from '../../../server/utils/locationUtils'
import { pathWithQuery, yesNoDisplayValue } from '../../../server/utils/utils'
import AppointmentUtils from '../../../server/utils/appointmentUtils'
import WarningComponent from '../components/warningComponent'

export default class CheckAppointmentDetailsPage extends Page {
  private readonly projectDetails: SummaryListComponent

  readonly notesDetails: SummaryListComponent

  readonly complianceDetails: SummaryListComponent

  readonly hoursDetails: SummaryListComponent

  readonly sharedDetails: SummaryListComponent

  readonly supervisorInput: SelectInput

  readonly warningMessage: WarningComponent

  readonly appointment: AppointmentDto

  private readonly project: ProjectDto

  constructor(appointment: AppointmentDto, project: ProjectDto) {
    const offender = new Offender(appointment.offender)

    super(offender.name)
    this.appointment = appointment
    this.project = project
    this.projectDetails = new SummaryListComponent('Project details')
    this.notesDetails = new SummaryListComponent('Notes')
    this.complianceDetails = new SummaryListComponent('Compliance details')
    this.hoursDetails = new SummaryListComponent('Hours detail')
    this.sharedDetails = new SummaryListComponent('Shared information')
    this.supervisorInput = new SelectInput('supervisor')
    this.warningMessage = new WarningComponent('Outcome not recorded')
  }

  static visit(
    appointment: AppointmentDto,
    project: ProjectDto,
    originalSearch?: Record<string, string>,
  ): CheckAppointmentDetailsPage {
    const path = pathWithQuery(
      paths.appointments.update({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'appointment-details',
      }),
      originalSearch,
    )
    return this.visitAndCheck(path, appointment, project)
  }

  clickUpdate() {
    cy.get('a').contains('Update appointment').click()
  }

  shouldContainProjectDetails() {
    this.projectDetails.getValueWithLabel('Project').should('contain.text', this.project.projectName)
    this.projectDetails.getValueWithLabel('Project type').should('contain.text', this.project.projectType.name)
    this.projectDetails.getValueWithLabel('Supervising team').should('contain.text', this.appointment.supervisingTeam)
    this.projectDetails
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.appointment.date))
    this.projectDetails
      .getValueWithLabel('Time')
      .should(
        'contain.text',
        `${DateTimeFormats.stripTime(this.appointment.startTime)} - ${DateTimeFormats.stripTime(this.appointment.endTime)}`,
      )
    this.projectDetails.getValueWithLabel('Region').should('contain.text', this.project.providerName)
    this.projectDetails
      .getValueWithLabel('Pick up time')
      .should('contain.text', DateTimeFormats.stripTime(this.appointment.pickUpData.time))
    this.projectDetails
      .getValueWithLabel('Pick up place')
      .should(
        'contain.text',
        LocationUtils.locationToString(this.appointment.pickUpData.pickupLocation, { withLineBreaks: false }),
      )
    this.projectDetails
      .getValueWithLabel('Supervising officer')
      .should('contain.text', this.appointment.supervisorOfficerName)
  }

  shouldContainNotesDetails(): void {
    this.notesDetails.getValueWithLabel('Notes detail').should('contain.text', this.appointment.notes)

    this.notesDetails
      .getValueWithLabel('Sensitive')
      .should('contain.text', yesNoDisplayValue(this.appointment.sensitive))
  }

  shouldContainComplianceDetails(): void {
    this.complianceDetails
      .getValueWithLabel('Wore hi-vis')
      .should('contain.text', yesNoDisplayValue(this.appointment.attendanceData.hiVisWorn))

    this.complianceDetails
      .getValueWithLabel('Working intensively')
      .should('contain.text', yesNoDisplayValue(this.appointment.attendanceData.workedIntensively))

    this.complianceDetails
      .getValueWithLabel('Work quality')
      .should('contain.text', AppointmentUtils.formatComplianceRatings(this.appointment.attendanceData.workQuality))

    this.complianceDetails
      .getValueWithLabel('Behaviour')
      .should('contain.text', AppointmentUtils.formatComplianceRatings(this.appointment.attendanceData.behaviour))
  }

  shouldContainTimeDetails(args: { worked: string; penalty: string; credited: string }) {
    this.hoursDetails.getValueWithLabel('Hours worked').should('contain.text', args.worked)
    this.hoursDetails.getValueWithLabel('Penalty hours').should('contain.text', args.penalty)
    this.hoursDetails.getValueWithLabel('Hours credited').should('contain.text', args.credited)
  }

  shouldShowSharedInformation() {
    this.sharedDetails
      .getValueWithLabel('Enforcement action')
      .should('contain.text', this.appointment.enforcementData.enforcementActionName)
    this.sharedDetails
      .getValueWithLabel('Respond by')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.appointment.enforcementData.respondBy))
    this.sharedDetails
      .getValueWithLabel('Alert sent')
      .should('contain.text', yesNoDisplayValue(this.appointment.alertActive))
  }

  shouldNotShowContinueButton(): void {
    cy.contains('button', 'Continue').should('not.exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Appointment details')
  }
}
