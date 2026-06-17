export default class RadioOrCheckboxGroupComponent {
  constructor(private readonly name: string) {}

  getAll(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`input[name="${this.name}"]`)
  }

  getOptionWithValue(value: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`input[name="${this.name}"][value="${value}"]`)
  }

  checkOptionWithValue(value: string) {
    this.getOptionWithValue(value).check()
  }

  shouldHaveSelectedValue(value: string) {
    this.getOptionWithValue(value).should('be.checked')
  }

  shouldHaveUnselectedValue(id: string): void {
    this.getOptionWithValue(id).should('not.be.checked')
  }

  shouldNotHaveASelectedValue() {
    this.getAll().should('not.be.checked')
  }

  shouldBeVisible() {
    this.getAll().should('exist')
  }

  shouldNotBeVisible() {
    this.getAll().should('not.exist')
  }
}
