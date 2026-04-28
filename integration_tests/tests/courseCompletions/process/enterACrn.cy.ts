//  Feature: Find a person to process a course completion for
//    As a case admin
//    I want to enter a crn for a person
//    So that I can process the completion for the right person

//  Scenario: Submitting the form
//    Given I am on the form page
//    When I complete the form
//    Then I should see the next page of the form

//  Scenario: Validating the form
//    Given I am on the form page
//    When I submit an invalid form
//    Then I should see the page with errors

//  Scenario: CRN not found
//    Given I am on the form page
//    When I complete the form with an invalid CRN
//    Then I should see the page with errors

//  Scenario: Navigating back
//    Given I am on the form page
//    When I click back
//    Then I should see the course completion details page

//  Scenario: Navigates back to search results
//    Given I am on the page
//    When I click back
//    Then I should see the course completion details page
//    And I click back again
//    Then I should see the course completion search page with results

//  Scenario: Navigating to unable to credit time page
//    Given I am on the form page
//    When I click the unable to credit time link
//    Then I should see the unable to credit time page

import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import {
  communityCampusPduFactory,
  communityCampusPdusFactory,
} from '../../../../server/testutils/factories/communityCampusPduFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import pagedModelCourseCompletionEventFactory from '../../../../server/testutils/factories/pagedModelCourseCompletionEventFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import CourseCompletionPage from '../../../pages/courseCompletions/courseCompletionPage'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import SearchCourseCompletionsPage from '../../../pages/courseCompletions/searchCourseCompletionsPage'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'
import Page from '../../../pages/page'

context('Crn Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const offender = offenderFullFactory.build()
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })
  const form = courseCompletionFormFactory.build({ crn: offender.crn })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubSaveCourseCompletionForm', courseCompletionFormFactory.build())
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    //  When I complete the form
    page.enterCrn(offender.crn)
    page.clickSubmit()

    // Then I should see the next page of the form
    Page.verifyOnPage(PersonPage, courseCompletion)
  })

  // Scenario: Validating the form
  it('validates the form', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    //  When I submit an invalid form
    page.clickSubmit()

    // Then I should see the page with errors
    Page.verifyOnPage(CrnPage)
    page.shouldShowValidationErrors()
  })

  // Scenario: CRN not found
  it('shows CRN not found error', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    //  When I complete the form with an invalid CRN
    page.enterCrn('invalid-crn')
    page.clickSubmit()

    // Then I should see the page with errors
    Page.verifyOnPage(CrnPage)
    page.shouldShowCrnNotFoundError()
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    //  When I click back
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)
  })

  // Scenario: Navigates back to search results
  it('navigates back to search results', () => {
    const pdu = communityCampusPduFactory.build()
    const provider = providerSummaryFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    // Given I am on the page
    const page = CrnPage.visit(courseCompletion, undefined, { pdu: pdu.id, provider: provider.code })

    // When I click back
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)

    // And I click back again
    cy.task('stubGetCommunityCampusPdus', { pdus: communityCampusPdusFactory.build() })
    cy.task('stubGetProviders', {
      providers: { providers: providerSummaryFactory.buildList(2) },
    })
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: [courseCompletion],
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: provider.code,
        pduId: pdu.id,
        username: 'some-name',
      },
      courseCompletions: courseCompletionResponse,
    })
    page.clickBack()

    // Then I should see the course completion search page with search results
    const searchPage = Page.verifyOnPage(SearchCourseCompletionsPage, courseCompletion)
    searchPage.shouldShowSearchResults(courseCompletion)
  })

  // Scenario: Navigating to unable to credit time page
  it('navigates to unable to credit time page', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    // When I click the unable to credit time link
    page.clickUnableToCreditTimeLink()

    // Then I should see the unable to credit time page
    Page.verifyOnPage(UnableToCreditTimePage, courseCompletion)
  })
})
