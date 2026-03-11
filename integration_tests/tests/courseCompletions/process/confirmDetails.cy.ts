//  Feature: Check submitted course completion details
//    As a case admin
//    I want to check the details I have entered
//    So that I can process a course completion correctly

//  Scenario: Confirming a course completion update
//    Given I am on the confirm page of an in progress update
//    Then I can see my submitted answers

//  Scenario: Navigating back
//    Given I am on the confirm page of an in progress update
//    And I click back
//    Then I can see the outcome page

//  Scenario: Changing submitted answers
//    Scenario: Changing the CRN
//      Given I am on the confirm page of an in progress update
//      And I click change CRN
//      Then I can see the CRN page

import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import ConfirmDetailsPage from '../../../pages/courseCompletions/process/confirmDetailsPage'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import Page from '../../../pages/page'

context('Confirm details page', () => {
  const courseCompletion = courseCompletionFactory.build()
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubFindCourseCompletion', { courseCompletion })
  })

  // Scenario: Confirming a course completion update
  it('shows all completed answers for the current form', () => {
    const form = courseCompletionFormFactory.build()

    // Given I am on the confirm page of an in progress update
    cy.task('stubGetCourseCompletionForm', form)

    const page = ConfirmDetailsPage.visit(courseCompletion, form)

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails()
  })

  // Scenario: Navigating back
  describe('navigating back', () => {
    it('navigates back to the outcome page', () => {
      const form = courseCompletionFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubGetCourseCompletionForm', form)

      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click back
      page.clickBack()

      // Then I can see the outcome page
      Page.verifyOnPage(OutcomePage)
    })
  })

  // Scenario: Changing submitted answers
  describe('Changing answers', () => {
    // Scenario: Changing the CRN
    it('navigates back to the CRN page', () => {
      const form = courseCompletionFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubGetCourseCompletionForm', form)

      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change CRN
      page.clickChange('CRN')

      // Then I can see the CRN page
      const crnPage = Page.verifyOnPage(CrnPage)
      crnPage.shouldHaveCrnValue(form.crn)
    })
  })
})
