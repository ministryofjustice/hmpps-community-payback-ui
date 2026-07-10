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

  constructor(offender: AppointmentDto['offender']) {
    super(new Offender(offender).name)
    this.projectDetails = new SummaryListComponent('Project details')
    this.notesDetails = new SummaryListComponent('Notes')
    this.complianceDetails = new SummaryListComponent('Compliance details')
    this.hoursDetails = new SummaryListComponent('Hours detail')
    this.sharedDetails = new SummaryListComponent('Shared information')
    this.supervisorInput = new SelectInput('supervisor')
    this.warningMessage = new WarningComponent('Outcome not recorded')
  }

  static visit(appointment: AppointmentDto, originalSearch?: Record<string, string>): CheckAppointmentDetailsPage {
    const path = pathWithQuery(
      paths.appointments.update({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'appointment-details',
      }),
      originalSearch,
    )
    return this.visitAndCheck(path, appointment.offender)
  }

  clickUpdate() {
    cy.get('a').contains('Update appointment').click()
  }

  shouldContainProjectDetails(appointment: AppointmentDto, project: ProjectDto) {
    this.projectDetails.getValueWithLabel('Project').should('contain.text', project.projectName)
    this.projectDetails.getValueWithLabel('Project type').should('contain.text', project.projectType.name)
    this.projectDetails.getValueWithLabel('Supervising team').should('contain.text', appointment.supervisingTeam)
    this.projectDetails
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(appointment.date))
    this.projectDetails
      .getValueWithLabel('Time')
      .should(
        'contain.text',
        `${DateTimeFormats.stripTime(appointment.startTime)} - ${DateTimeFormats.stripTime(appointment.endTime)}`,
      )
    this.projectDetails.getValueWithLabel('Region').should('contain.text', project.providerName)
    this.projectDetails
      .getValueWithLabel('Pick up time')
      .should('contain.text', DateTimeFormats.stripTime(appointment.pickUpData.time))
    this.projectDetails
      .getValueWithLabel('Pick up place')
      .should(
        'contain.text',
        LocationUtils.locationToString(appointment.pickUpData.pickupLocation, { withLineBreaks: false }),
      )
    this.projectDetails
      .getValueWithLabel('Supervising officer')
      .should('contain.text', appointment.supervisorOfficerName)
  }

  shouldContainNotesDetails(appointment: AppointmentDto): void {
    this.notesDetails.getValueWithLabel('Notes detail').should('contain.text', appointment.notes)

    this.notesDetails.getValueWithLabel('Sensitive').should('contain.text', yesNoDisplayValue(appointment.sensitive))
  }

  shouldContainComplianceDetails(appointment: AppointmentDto): void {
    this.complianceDetails
      .getValueWithLabel('Work quality')
      .should('contain.text', AppointmentUtils.formatComplianceRatings(appointment.attendanceData.workQuality))

    this.complianceDetails
      .getValueWithLabel('Behaviour')
      .should('contain.text', AppointmentUtils.formatComplianceRatings(appointment.attendanceData.behaviour))
  }

  shouldContainTimeDetails(args: { worked: string; penalty: string; credited: string }) {
    this.hoursDetails.getValueWithLabel('Hours worked').should('contain.text', args.worked)
    this.hoursDetails.getValueWithLabel('Penalty hours').should('contain.text', args.penalty)
    this.hoursDetails.getValueWithLabel('Hours credited').should('contain.text', args.credited)
  }

  shouldShowSharedInformation(appointment: AppointmentDto) {
    this.sharedDetails
      .getValueWithLabel('Enforcement action')
      .should('contain.text', appointment.enforcementData.enforcementActionName)
    this.sharedDetails
      .getValueWithLabel('Respond by')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(appointment.enforcementData.respondBy))
    this.sharedDetails
      .getValueWithLabel('Alert sent')
      .should('contain.text', yesNoDisplayValue(appointment.alertActive))
  }

  shouldNotShowContinueButton(): void {
    cy.contains('button', 'Continue').should('not.exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Appointment details')
  }
}
