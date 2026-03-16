export default class SummaryListComponent {
  constructor(private readonly title: string = undefined) {}

  getValueWithLabel(label: string) {
    return this.component().find('dt').contains(label).find('+dd')
  }

  clickActionWithLabel(label: string) {
    return this.getValueWithLabel(label).next('dd').find('a').click()
  }

  shouldNotContainValueWithLabel(label: string) {
    return this.component().find('dt').should('not.contain.text', label)
  }

  private component() {
    return this.title ? cy.get('.govuk-summary-card').filter(`:contains(${this.title})`) : cy.get('dl')
  }
}
