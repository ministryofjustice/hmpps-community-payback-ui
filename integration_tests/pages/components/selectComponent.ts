export default class SelectInput {
  constructor(private readonly name: string) {}

  shouldHaveValue(value: string) {
    cy.get(`select#${this.name} option:selected`).should('have.value', value)
  }

  shouldNotHaveAValue() {
    cy.get(`select#${this.name} option:selected`).should('have.value', '')
  }
}
