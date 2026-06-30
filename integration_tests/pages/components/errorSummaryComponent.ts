export default class ErrorSummaryComponent {
  shouldShowErrorSummary(field: string, errorMessage: string) {
    cy.get(`[data-cy-error-${field}]`).should('contain', errorMessage)
  }
}
