import { CommunityCampusPduDto, EteCourseCompletionEventDto, ProviderSummaryDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SelectInput from '../components/selectComponent'
import Page from '../page'

export default class SearchCourseCompletionsPage extends Page {
  pduSelect: SelectInput

  regionSelect: SelectInput

  constructor() {
    super('Process employment, training and education completions')

    this.pduSelect = new SelectInput('pdu')
    this.regionSelect = new SelectInput('provider')
  }

  static visit(): SearchCourseCompletionsPage {
    cy.visit(paths.courseCompletions.index({}))

    return new SearchCourseCompletionsPage()
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Find course completions')
    cy.get('label').contains('Region')
    cy.get('label').contains('PDU')
  }

  completeSearchForm() {
    cy.get('#startDate-day').type('18')
    cy.get('#startDate-month').type('09')
    cy.get('#startDate-year').type('2025')
    cy.get('#endDate-day').type('20')
    cy.get('#endDate-month').type('09')
    cy.get('#endDate-year').type('2025')
  }

  selectPdu(pdu: CommunityCampusPduDto) {
    this.pduSelect.select(pdu.id)
  }

  selectRegion(provider: ProviderSummaryDto) {
    this.regionSelect.select(provider.code)
  }

  submitForm() {
    this.clickSubmit('Apply filters')
  }

  shouldShowSearchResults(courseCompletion: EteCourseCompletionEventDto) {
    cy.get('td').eq(0).should('have.text', `${courseCompletion.firstName} ${courseCompletion.lastName}`)
    cy.get('td').eq(1).should('have.text', courseCompletion.id)
    cy.get('td').eq(2).should('have.text', courseCompletion.courseName)
    cy.get('td')
      .eq(3)
      .should('have.text', DateTimeFormats.isoDateToUIDate(courseCompletion.completionDateTime, { format: 'medium' }))
    cy.get('td')
      .eq(4)
      .contains('View')
      .find('span.govuk-visually-hidden')
      .should('have.text', `${courseCompletion.firstName} ${courseCompletion.lastName}`)
  }

  shouldShowNoResultsMessage() {
    cy.get('h2').should('contain.text', 'No results')
  }

  completeStartDate() {
    cy.get('#startDate-day').type('18')
    cy.get('#startDate-month').type('9')
    cy.get('#startDate-year').type('2025')
  }

  completeEndDate() {
    cy.get('#endDate-day').type('19')
    cy.get('#endDate-month').type('9')
    cy.get('#endDate-year').type('2025')
  }

  shouldShowErrorSummary() {
    cy.get('.govuk-error-summary__list').find('a[href="#provider"]').should('have.text', 'Select a region')
  }

  clickViewCourseCompletion() {
    cy.get('td').eq(4).contains('View').click()
  }

  shouldShowPaginationControls() {
    cy.get('.govuk-pagination').should('exist')
  }

  clickNextPage() {
    cy.get('.govuk-pagination__next').contains('Next').click()
  }
}
