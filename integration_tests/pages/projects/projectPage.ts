import { AppointmentSummaryDto, OffenderFullDto, ProjectDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'
import LocationUtils from '../../../server/utils/locationUtils'
import DataTableComponent from '../components/datatableComponent'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Utils from '../../utils'

export default class ProjectPage extends Page {
  private readonly projectDetails: SummaryListComponent

  private readonly appointmentList: DataTableComponent

  constructor(private readonly project: ProjectDto) {
    super(project.projectName)
    this.projectDetails = new SummaryListComponent()
    this.appointmentList = new DataTableComponent()
  }

  static visit(project: ProjectDto): ProjectPage {
    const path = `${paths.projects.show({ projectCode: project.projectCode.toString() })}`
    cy.visit(path)

    return new ProjectPage(project)
  }

  shouldShowProjectDetails() {
    this.projectDetails
      .getValueWithLabel('Address')
      .should('contain.text', LocationUtils.locationToString(this.project.location, { withLineBreaks: false }))
    this.projectDetails
      .getValueWithLabel('Primary contact name')
      .should('contain.text', this.project.beneficiaryDetails.contactName)
    this.projectDetails
      .getValueWithLabel('Primary contact email')
      .should('contain.text', this.project.beneficiaryDetails.emailAddress)
    this.projectDetails
      .getValueWithLabel('Primary contact phone')
      .should('contain.text', this.project.beneficiaryDetails.telephoneNumber)
  }

  shouldShowAppointmentsWithMissingOutcomes(appointments: Array<AppointmentSummaryDto>) {
    const appointmentValues = [...appointments].sort(Utils.sortByDate).map(appointmentSummary => {
      const offender = appointmentSummary.offender as OffenderFullDto

      return [
        `${offender.forename} ${offender.surname}${offender.crn}`,
        DateTimeFormats.isoDateToUIDate(appointmentSummary.date, { format: 'medium' }),
        DateTimeFormats.stripTime(appointmentSummary.startTime),
        DateTimeFormats.stripTime(appointmentSummary.endTime),
        appointmentSummary.daysOverdue?.toString() ?? '',
      ]
    })

    this.appointmentList.shouldHaveRowsWithContent(appointmentValues)
  }
}
