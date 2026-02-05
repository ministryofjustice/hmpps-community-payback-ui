import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class ProjectPage extends Page {
  private readonly projectDetails: SummaryListComponent

  constructor() {
    super('Age UK')
    this.projectDetails = new SummaryListComponent()
  }

  static visit(): ProjectPage {
    const path = `${paths.projects.show({ projectCode: '1' })}`
    cy.visit(path)

    return new ProjectPage()
  }

  shouldShowProjectDetails() {
    this.projectDetails.getValueWithLabel('Address').should('contain.text', "20 St Ann's Square, Mancherster, M2 7HG")
    this.projectDetails.getValueWithLabel('Opening times').should('contain.text', '09:00 - 17:30')
    this.projectDetails
      .getValueWithLabel('Primary contact name')
      .should('contain.text', 'Karen Downing, General manager')
    this.projectDetails.getValueWithLabel('Primary contact email').should('contain.text', 'karen@ageuk.co.uk')
    this.projectDetails.getValueWithLabel('Primary contact phone').should('contain.text', '0161 833 3944')
  }
}
