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
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import ConfirmDetailsPage from '../../../pages/courseCompletions/process/confirmDetailsPage'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import Page from '../../../pages/page'

context('Confirm details page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const teams = providerTeamSummaryFactory.buildList(2)
  const [team] = teams
  const projects = pagedModelProjectOutcomeSummaryFactory.build()
  const [project] = projects.content
  const { providerCode } = courseCompletion.pdu
  const form = courseCompletionFormFactory.build({ team: team.code, project: project.projectCode })
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })
    cy.task('stubGetCourseCompletionForm', form)
  })

  // Scenario: Confirming a course completion update
  it('shows all completed answers for the current form', () => {
    // Given I am on the confirm page of an in progress update
    const page = ConfirmDetailsPage.visit(courseCompletion, form)

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails(team, project)
  })

  // Scenario: Navigating back
  describe('navigating back', () => {
    it('navigates back to the outcome page', () => {
      // Given I am on the confirm page of an in progress update
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
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change CRN
      page.clickChange('CRN')

      // Then I can see the CRN page
      const crnPage = Page.verifyOnPage(CrnPage)
      crnPage.shouldHaveCrnValue(form.crn)
    })
  })
})
