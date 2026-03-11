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

import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import CourseCompletionPage from '../../../pages/courseCompletions/courseCompletionPage'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import Page from '../../../pages/page'

context('Crn Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', courseCompletionFormFactory.build())
    cy.task('stubSaveCourseCompletionForm', courseCompletionFormFactory.build())
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    //  When I complete the form
    page.enterCrn()
    page.clickSubmit()

    // Then I should see the next page of the form
    Page.verifyOnPage(PersonPage)
  })

  // Scenario: Validating the form
  it('validates the form', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion)

    //  When I submit an invalid form
    page.clickSubmit()

    // Then I should see the page with errors
    Page.verifyOnPage(CrnPage)
    page.shouldShowErrors()
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
})
