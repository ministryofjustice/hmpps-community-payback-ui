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

//  Scenario: Navigating back
//    Given I am on the form page
//    When I click back
//    Then I should see the course completion details page

//  Scenario: Navigating to unable to credit time page
//    Given I am on the form page
//    When I click the unable to credit time link
//    Then I should see the unable to credit time page

import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import CourseCompletionPage from '../../../pages/courseCompletions/courseCompletionPage'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'
import Page from '../../../pages/page'
import SearchCourseCompletionsPage from '../../../pages/courseCompletions/searchCourseCompletionsPage'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import { communityCampusPdusFactory } from '../../../../server/testutils/factories/communityCampusPduFactory'

context('Unable to credit time', () => {
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
  it('submits course completion resolution and shows success message on course completion page', () => {
    cy.task('stubSaveCourseCompletion', { courseCompletion })
    cy.task('stubGetCommunityCampusPdus', { pdus: communityCampusPdusFactory.build() })
    cy.task('stubGetProviders', {
      providers: { providers: providerSummaryFactory.buildList(2) },
    })

    //  Given I am on the form page
    const page = UnableToCreditTimePage.visit(courseCompletion)

    //  When I complete the form
    page.enterNotes()
    page.clickSubmit('Submit')

    // Then I can see the course completion search page with success message
    const courseCompletionPage = Page.verifyOnPage(SearchCourseCompletionsPage)
    courseCompletionPage.shouldShowSuccessMessage(
      `The course completion for ${offender.forename} ${offender.surname} has been processed`,
    )
  })

  // Scenario: Validating the form
  it('validates the form', () => {
    //  Given I am on the form page
    const page = UnableToCreditTimePage.visit(courseCompletion)

    //  When I submit an invalid form
    page.enterNotesWithCharacterLength(251)
    page.clickSubmit('Submit')

    // Then I should see the page with errors
    Page.verifyOnPage(UnableToCreditTimePage)
    page.shouldShowError()
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    //  Given I am on the form page
    const page = UnableToCreditTimePage.visit(courseCompletion)

    //  When I click back
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)
  })
})
