//  Feature: Confirm the project to process a course completion against
//    As a case admin
//    I want to select the project
//    So that I can process the completion for the right project

//  Scenario: Selecting project team
//    Given I am on the form page
//    Then I should see the available project teams

import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import Page from '../../../pages/page'

context('Project Page', () => {
  const courseCompletion = courseCompletionFactory.build({ region: 'code' })
  const teams = providerTeamSummaryFactory.buildList(2)
  const projects = pagedModelProjectOutcomeSummaryFactory.build()
  const { providerCode } = courseCompletion.pdu

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', courseCompletionFormFactory.build())
    cy.task('stubSaveCourseCompletionForm')
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })
  })

  // Scenario: Selecting project
  it('enables selection of project team and project', () => {
    const [team] = teams
    const [project] = projects.content
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })
    //  Given I am on the form page
    const page = ProjectPage.visit(courseCompletion)

    // When I select a project team
    page.selectTeam(team)

    // And I select a project and click continue
    page.selectProject(project)
    page.clickSubmit()

    // Then I see the next page
    Page.verifyOnPage(AppointmentPage)
  })
})
