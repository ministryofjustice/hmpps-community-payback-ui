import { AppointmentSummaryDto, OffenderFullDto, ProjectDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'
import LocationUtils from '../../../server/utils/locationUtils'
import DataTableComponent from '../components/datatableComponent'
import PaginationComponent from '../components/paginationComponent'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

export default class ProjectPage extends Page {
  private readonly projectDetails: SummaryListComponent

  private readonly appointmentList: DataTableComponent

  readonly pagination: PaginationComponent

  constructor(private readonly project: ProjectDto) {
    super(project.projectName)
    this.projectDetails = new SummaryListComponent()
    this.appointmentList = new DataTableComponent()
    this.pagination = new PaginationComponent()
  }

  static visit(project: ProjectDto): ProjectPage {
    const path = `${paths.projects.show({ projectCode: project.projectCode.toString() })}`
    return this.visitAndCheck(path, project)
  }

  clickAddAnAppointment() {
    cy.get('a').contains('Add an appointment').click()
  }

  clickUpdateAnAppointment() {
    cy.get('a').contains('View').eq(0).click()
  }

  clickNameLink(offender: OffenderFullDto) {
    cy.get('a').contains(`${offender.surname}, ${offender.forename}`).click()
  }

  clickPastAppointmentsTab() {
    cy.get('.moj-sub-navigation a').contains('Past appointments').click()
  }

  clickMissingOutcomesTab() {
    cy.get('.moj-sub-navigation a').contains('Missing outcomes').click()
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

  shouldShowAppointments(appointments: Array<AppointmentSummaryDto>) {
    const appointmentValues = appointments.map(appointmentSummary => {
      const offender = appointmentSummary.offender as OffenderFullDto

      return [
        `${offender.surname}, ${offender.forename}${offender.crn}`,
        DateTimeFormats.isoDateToUIDate(appointmentSummary.date, { format: 'medium' }),
        DateTimeFormats.timePeriod(appointmentSummary.startTime, appointmentSummary.endTime),
        appointmentSummary.contactOutcome ? appointmentSummary.contactOutcome.name : 'Not entered',
      ]
    })

    this.appointmentList.shouldHaveRowsWithContent(appointmentValues)
  }

  shouldShowErrorMessage(message: string, messageIsLink: boolean = true) {
    cy.get('[data-testid="project-show-error-summary"]').within(() => {
      if (messageIsLink) {
        cy.get('a').contains(message)
      } else {
        cy.get('li').contains(message)
      }
    })
  }
}
