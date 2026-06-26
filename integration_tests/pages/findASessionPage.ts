import Page from './page'
import paths from '../../server/paths'
import { ProviderSummaryDto, ProviderTeamSummaryDto, SessionSummaryDto } from '../../server/@types/shared'
import SelectInput from './components/selectComponent'
import DateTimeFormats from '../../server/utils/dateTimeUtils'

export default class FindASessionPage extends Page {
  regionSelect = new SelectInput('provider')

  teamSelect = new SelectInput('team')

  constructor() {
    super('Find a group session')
  }

  static visit(): FindASessionPage {
    return this.visitAndCheck(paths.sessions.index({}))
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Filter group sessions')
    cy.get('label').contains('Region')
    cy.get('label').contains('Project team')
    cy.get('legend').contains('Date')
  }

  enterDate() {
    cy.get('#date-day').type('18')
    cy.get('#date-month').type('09')
    cy.get('#date-year').type('2025')
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

  clickNextPage() {
    cy.get('.govuk-pagination__next').contains('Next').click()
  }

  shouldShowPaginationControls() {
    cy.get('.govuk-pagination').should('exist')
  }

  shouldShowSearchResults(result: SessionSummaryDto) {
    cy.get('td').eq(0).should('contain.text', result.projectName)
    cy.get('td').eq(0).should('contain.text', result.projectCode)
    cy.get('td').eq(1).should('have.text', DateTimeFormats.isoDateToUIDate(result.date))
    cy.get('td').eq(2).should('have.text', result.numberOfOffendersAllocated)
    cy.get('td').eq(3).should('have.text', result.numberOfOffendersWithOutcomes)
    cy.get('td').eq(4).should('have.text', result.numberOfOffendersWithEA)
  }

  shouldShowPopulatedSearchForm() {
    cy.get('#date-day').should('have.value', '18')
    cy.get('#date-month').should('have.value', '09')
    cy.get('#date-year').should('have.value', '2025')
  }

  shouldShowErrorSummary() {
    cy.get('.govuk-error-summary__list').find('a[href="#team"]').should('have.text', 'Choose a team')
  }

  shouldShowNoResultsMessage() {
    cy.get('h2').should('contain.text', 'No results')
  }

  shouldHavePaddedStartDateValue() {
    cy.get('#date-day').should('have.value', '18')
    cy.get('#date-month').should('have.value', '09')
    cy.get('#date-year').should('have.value', '2025')
  }

  shouldShowRegion(name: string) {
    cy.get('label').contains('Region').next().should('contain.text', name)
  }
}
