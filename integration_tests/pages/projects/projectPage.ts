import { ProjectDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'
import LocationUtils from '../../../server/utils/locationUtils'

export default class ProjectPage extends Page {
  private readonly projectDetails: SummaryListComponent

  constructor(private readonly project: ProjectDto) {
    super(project.projectName)
    this.projectDetails = new SummaryListComponent()
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
      .should('contain.text', this.project.beneficiaryDetailsDto.contactName)
    this.projectDetails
      .getValueWithLabel('Primary contact email')
      .should('contain.text', this.project.beneficiaryDetailsDto.emailAddress)
    this.projectDetails
      .getValueWithLabel('Primary contact phone')
      .should('contain.text', this.project.beneficiaryDetailsDto.telephoneNumber)
  }
}
