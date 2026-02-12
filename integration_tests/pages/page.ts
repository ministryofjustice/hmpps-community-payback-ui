import 'cypress-axe'
import { Result } from 'axe-core'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new (...args: Array<unknown>) => T, ...args: Array<unknown>): T {
    return new constructor(...args)
  }

  protected constructor(private readonly title: string) {
    this.checkOnPage()
  }

  // Ignoring rule `no-empty-function`
  // This is designed to be empty to provide an optional page verification override at the class implementation level
  protected customCheckOnPage(): void {} // eslint-disable-line no-empty-function

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
    cy.injectAxe()
    cy.configureAxe({
      rules: [
        // Ignore the "All page content should be contained by landmarks", which conflicts with GOV.UK guidance (https://design-system.service.gov.uk/components/back-link/#how-it-works)
        { id: 'region', reviewOnFail: true, selector: '.govuk-back-link' },
      ],
    })
    cy.checkA11y(undefined, undefined, this.logAccessibilityViolations)
    this.customCheckOnPage()
  }

  clickBack = () => {
    cy.get('a').contains('Back').click()
  }

  clickSubmit(text = 'Continue'): void {
    cy.get('button').contains(text).click()
  }

  getTextInputById(id: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`#${id}`)
  }

  getTextInputByIdAndEnterDetails(id: string, details: string): void {
    cy.get(`#${id}`).type(details)
  }

  selectOptionByNameAndValue({ name, value }: { name: string, value: string }) {
    cy.get(`[name="${name}"]`).select(value)
  }

  shouldShowErrorSummary(field: string, errorMessage: string) {
    cy.get(`[data-cy-error-${field}]`).should('contain', errorMessage)
  }

  shouldShowSuccessMessage(message: string): void {
    cy.get('.govuk-notification-banner').within(() => {
      cy.get('h2').contains('Success')
      cy.get('h3').contains(message)
    })
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  logAccessibilityViolations(violations: Result[]): void {
    cy.task('logAccessibilityViolationsSummary', `Accessibility violations detected: ${violations.length}`)

    const violationData = violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
      nodeTargets: nodes.map(node => node.target).join(' - '),
    }))

    cy.task('logAccessibilityViolationsTable', violationData)
  }
}
