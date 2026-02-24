import Page from './page'
import paths from '../../server/paths'
import { ProviderSummaryDto, ProviderTeamSummaryDto } from '../../server/@types/shared'
import SelectInput from './components/selectComponent'

export default class FindASessionPage extends Page {
  regionSelect = new SelectInput('provider')

  teamSelect = new SelectInput('team')

  constructor() {
    super('Find a group session')
  }

  static visit(): FindASessionPage {
    cy.visit(paths.sessions.index({}))

    return new FindASessionPage()
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Filter group sessions')
    cy.get('label').contains('Region')
    cy.get('label').contains('Project team')
    cy.get('legend').contains('From')
    cy.get('legend').contains('To')
  }

  completeSearchForm() {
    cy.get('#startDate-day').type('18')
    cy.get('#startDate-month').type('09')
    cy.get('#startDate-year').type('2025')
    cy.get('#endDate-day').type('20')
    cy.get('#endDate-month').type('09')
    cy.get('#endDate-year').type('2025')
  }

  completeStartDate() {
    cy.get('#startDate-day').type('18')
    cy.get('#startDate-month').type('9')
    cy.get('#startDate-year').type('2025')
  }

  selectRegion(provider: ProviderSummaryDto) {
    this.regionSelect.select(provider.code)
  }

  selectTeam(team: ProviderTeamSummaryDto) {
    this.teamSelect.select(team.code)
  }

  submitForm() {
    cy.get('button').contains('Apply filters').click()
  }

  clickOnASession() {
    cy.get('a').contains('project-name').click()
  }

  shouldShowSearchResults() {
    cy.get('td').eq(0).should('contain.text', 'project-name')
    cy.get('td').eq(0).should('contain.text', 'prj')
    cy.get('td').eq(1).should('have.text', '7 September 2025')
    cy.get('td').eq(2).should('have.text', '5')
    cy.get('td').eq(3).should('have.text', '3')
    cy.get('td').eq(4).should('have.text', '1')
  }

  shouldShowPopulatedSearchForm() {
    cy.get('#startDate-day').should('have.value', '18')
    cy.get('#startDate-month').should('have.value', '09')
    cy.get('#startDate-year').should('have.value', '2025')
    cy.get('#endDate-day').should('have.value', '20')
    cy.get('#endDate-month').should('have.value', '09')
    cy.get('#endDate-year').should('have.value', '2025')
  }

  shouldShowErrorSummary() {
    cy.get('.govuk-error-summary__list')
      .find('a[href="#endDate-day"]')
      .should('have.text', 'To date must include a day, month and year')
  }

  shouldShowNoResultsMessage() {
    cy.get('h2').should('contain.text', 'No results')
  }

  shouldHavePaddedStartDateValue() {
    cy.get('#startDate-day').should('have.value', '18')
    cy.get('#startDate-month').should('have.value', '09')
    cy.get('#startDate-year').should('have.value', '2025')
  }

  shouldShowRegion(name: string) {
    cy.get('label').contains('Region').next().should('contain.text', name)
  }
}
