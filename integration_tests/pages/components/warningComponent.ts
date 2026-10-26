export default class WarningComponent {
  constructor(private readonly message: string) {}

  clickCallToAction() {
    return this.component().find('a').click()
  }

  shouldBeVisible() {
    this.component().should('be.visible')
  }

  shouldNotBeVisible() {
    cy.contains('.govuk-warning-text', this.message).should('not.exist')
  }

  private component() {
    return cy.get('.govuk-warning-text').contains(this.message)
  }
}
