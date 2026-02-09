//  Feature: View an course completion
//    As a case admin
//    I want to view a course completion
//
//  Given I am on the course completion page
//    Then I should see course completion details

import courseCompletionFactory from '../../../server/testutils/factories/courseCompletionFactory'
import CourseCompletionPage from '../../pages/courseCompletions/courseCompletionPage'

context('Project page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  it('shows project details', () => {
    const courseCompletion = courseCompletionFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    //  Given I am on the course completion page
    const page = CourseCompletionPage.visit(courseCompletion)

    //  Then I should see course completion details
    page.shouldShowCourseCompletionDetails()
  })
})
