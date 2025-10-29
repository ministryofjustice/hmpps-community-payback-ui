export default class SummaryListComponent {
  getValueWithLabel(label: string) {
    return cy.get('dt').contains(label).find('+dd')
  }

  shouldNotContainValueWithLabel(label: string) {
    return cy.get('dt').should('not.contain.text', label)
  }
}
