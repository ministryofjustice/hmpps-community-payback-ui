export default class PaginationComponent {
  clickNext() {
    cy.get('a').contains('Next').click({ force: true })
  }
}
