export default class PersonSearchComponent {
  enterSearchTerm(searchTerm: string) {
    cy.get('#search').type(searchTerm)
  }

  submitSearch() {
    cy.get('button').click()
  }

  clickPerson(crn: string) {
    cy.contains('td', crn).closest('tr').find('a.govuk-link').click()
  }
}
