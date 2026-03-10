//  Feature: View an course completion
//    As a case admin
//    I want to view a course completion
//  Scenario: Processing a course completion
//    Given I am on the course completion page
//    When I click process
//    Then I should see the first page of the form

import courseCompletionFactory from '../../../server/testutils/factories/courseCompletionFactory'
import CourseCompletionPage from '../../pages/courseCompletions/courseCompletionPage'
import CrnPage from '../../pages/courseCompletions/process/crnPage'
import Page from '../../pages/page'

context('Project page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  // Scenario: Processing a course completion
  it('enables processing a course completion', () => {
    const courseCompletion = courseCompletionFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })

    //  Given I am on the course completion page
    const page = CourseCompletionPage.visit(courseCompletion)
    page.shouldShowCourseCompletionDetails()

    //  When I click process
    page.clickProcess()

    // Then I should see the first page of the form
    Page.verifyOnPage(CrnPage)
  })
})
