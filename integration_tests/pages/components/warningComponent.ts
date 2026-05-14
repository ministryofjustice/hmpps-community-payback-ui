export default class WarningComponent {
  constructor(private readonly message: string) {}

  clickCallToAction() {
    return this.component().find('a').click()
  }

  shouldNotBeVisible() {
    cy.get('.govuk-warning-text').should('not.exist')
  }

  private component() {
    return cy.get('.govuk-warning-text').contains(this.message)
  }
}
