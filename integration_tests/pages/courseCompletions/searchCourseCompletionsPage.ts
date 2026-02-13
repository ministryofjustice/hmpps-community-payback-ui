import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Page from '../page'

export default class SearchCourseCompletionsPage extends Page {
  constructor() {
    super('Process employment, training and education completions')
  }

  static visit(): SearchCourseCompletionsPage {
    cy.visit(paths.courseCompletions.index({}))

    return new SearchCourseCompletionsPage()
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Find course completions')
    cy.get('label').contains('Region')
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

  submitForm() {
    cy.get('button').click()
  }

  shouldShowSearchResults(courseCompletion: EteCourseCompletionEventDto) {
    cy.get('td').eq(0).should('have.text', `${courseCompletion.firstName} ${courseCompletion.lastName}`)
    cy.get('td').eq(1).should('have.text', courseCompletion.id)
    cy.get('td').eq(2).should('have.text', courseCompletion.courseName)
    cy.get('td')
      .eq(3)
      .should('have.text', DateTimeFormats.isoDateToUIDate(courseCompletion.completionDate, { format: 'medium' }))
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

  shouldShowErrorSummary() {
    cy.get('.govuk-error-summary__list')
      .find('a[href="#endDate-day"]')
      .should('have.text', 'To date must include a day, month and year')
  }

  clickViewCourseCompletion() {
    cy.get('td').eq(4).contains('View').click()
  }
}
