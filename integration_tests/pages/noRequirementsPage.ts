import Page from './page'

export default class NoRequirementsPage extends Page {
  constructor(name: string) {
    super(name)
  }

  protected customCheckOnPage(): void {
    cy.get('.moj-alert__content').contains('There is no associated unpaid work requirement')
  }

  clickBack = () => {
    cy.get('a').contains('Find another person').click()
  }
}
