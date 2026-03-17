//  Feature: Confirm the project to process a course completion against
//    As a case admin
//    I want to select the project
//    So that I can process the completion for the right project

//  Scenario: Selecting project team
//    Given I am on the form page
//    Then I should see the available project teams

import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'

context('Project Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const teams = providerTeamSummaryFactory.buildList(2)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', courseCompletionFormFactory.build())
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: courseCompletion.pdu.providerCode })
  })

  // Scenario: Selecting project team
  it('displays the teams for region', () => {
    //  Given I am on the form page
    const page = ProjectPage.visit(courseCompletion)

    // Then I should see the available project teams
    page.shouldShowTeamInput()
  })
})
