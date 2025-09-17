export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  protected constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  clickManageDetails(): void {
    this.manageDetails().get('a').invoke('removeAttr', 'target')
    this.manageDetails().click()
  }

  signOut(): void {
    this.signOutLocator().click()
  }

  private signOutLocator = (): PageElement => cy.get('[data-qa=signOut]')

  private manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')
}
