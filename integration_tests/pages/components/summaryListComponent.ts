export default class SummaryListComponent {
  getValueWithLabel(label: string) {
    return cy.get('dt').contains(label).find('+dd')
  }

  clickActionWithLabel(label: string) {
    return this.getValueWithLabel(label).next('dd').find('a').click()
  }

  shouldNotContainValueWithLabel(label: string) {
    return cy.get('dt').should('not.contain.text', label)
  }
}
