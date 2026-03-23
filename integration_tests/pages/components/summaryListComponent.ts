export default class SummaryListComponent {
  constructor(private readonly title: string = undefined) {}

  getValueWithLabel(label: string, options?: { exact?: boolean }) {
    const matcher = options?.exact ? this.exactMatcher(label) : label
    return this.component().find('dt').contains(matcher).find('+dd')
  }

  clickActionWithLabel(label: string, options?: { exact?: boolean }) {
    return this.getValueWithLabel(label, options).next('dd').find('a').click()
  }

  shouldNotContainValueWithLabel(label: string) {
    return this.component().find('dt').should('not.contain.text', label)
  }

  private component() {
    return this.title ? cy.get('.govuk-summary-card').filter(`:contains(${this.title})`) : cy.get('dl')
  }

  private exactMatcher(label: string) {
    // Look for an exact match but account for white-spaces in the GOV.UK template (optional)
    return new RegExp(`^ *${label} *$`)
  }
}
