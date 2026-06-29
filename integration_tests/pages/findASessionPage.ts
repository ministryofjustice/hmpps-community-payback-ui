import Page from './page'
import paths from '../../server/paths'
import { ProviderSummaryDto, ProviderTeamSummaryDto, SessionSummaryDto } from '../../server/@types/shared'
import SelectInput from './components/selectComponent'
import DateTimeFormats from '../../server/utils/dateTimeUtils'
import DataTableComponent from './components/datatableComponent'

export default class FindASessionPage extends Page {
  regionSelect = new SelectInput('provider')

  teamSelect = new SelectInput('team')

  resultsTable = new DataTableComponent('Project')

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
    cy.get('label').contains('Date')
  }

  enterDate() {
    cy.get('#date').type('18/9/2025')
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
    const expected = [
      [
        `${result.projectName}${result.projectCode}`,
        DateTimeFormats.isoDateToUIDate(result.date),
        result.numberOfOffendersAllocated,
        result.numberOfOffendersWithOutcomes,
        result.numberOfOffendersWithEA,
      ],
    ]
    this.resultsTable.shouldHaveRowsWithContent(expected)
  }

  shouldShowPopulatedDate(date: string = '18/9/2025') {
    cy.get('#date').should('have.value', date)
  }

  shouldShowErrorSummary() {
    cy.get('.govuk-error-summary__list').find('a[href="#team"]').should('have.text', 'Choose a team')
  }

  shouldShowNoResultsMessage() {
    cy.get('h2').should('contain.text', 'No results')
  }

  shouldShowRegion(name: string) {
    cy.get('label').contains('Region').next().should('contain.text', name)
  }
}
