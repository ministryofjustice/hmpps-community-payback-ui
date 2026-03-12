//  Feature: Confirm a person to process a course completion for
//    As a case admin
//    I want to check the person I entered a crn for
//    So that I can process the completion for the right person

//  Scenario: Viewing person details
//    Given I am on the form page
//    Then I should see the person details

import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import PersonPage from '../../../pages/courseCompletions/process/personPage'

context('Person Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', courseCompletionFormFactory.build())
  })

  // Scenario: Viewing person details
  it('displays the community campus record', () => {
    //  Given I am on the form page
    const page = PersonPage.visit(courseCompletion)

    // Then I should see the person details
    page.courseCompletionRecord.shouldShowLearnerDetails()
  })
})
