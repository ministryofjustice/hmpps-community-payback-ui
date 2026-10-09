import Page from './page'

export default class HomePage extends Page {
  constructor() {
    super('Record attendance on community payback')
  }

  static visit(): HomePage {
    return this.visitAndCheck('/')
  }

  shouldShowSignOutButton(): void {
    cy.get('[data-qa="signOut"]').should('exist')
  }

  shouldShowServiceName(): void {
    cy.get('[data-qa="service-navigation"]').contains('a', 'Manage community payback').should('have.attr', 'href', '/')
  }

  shouldShowCards(sections: Array<string>) {
    sections.forEach(section => cy.get(`[data-cy-card-section="${section}"]`).should('exist'))
  }
}
