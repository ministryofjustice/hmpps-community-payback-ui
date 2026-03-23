//  Feature: Complete appointment details
//    As a case admin
//    I want to record an outcome for a person
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
//    Then I should see the previous page

import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import ConfirmDetailsPage from '../../../pages/courseCompletions/process/confirmDetailsPage'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import Page from '../../../pages/page'

context('Outcome Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const emptyFields = {
    timeToCredit: undefined,
    'date-day': undefined,
    'date-month': undefined,
    'date-year': undefined,
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', courseCompletionFormFactory.build(emptyFields))
    cy.task('stubSaveCourseCompletionForm')
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    const teams = providerTeamSummaryFactory.buildList(2)
    const [team] = teams
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    const [project] = projects.content
    const { providerCode } = courseCompletion.pdu

    cy.task(
      'stubGetCourseCompletionForm',
      courseCompletionFormFactory.build({ ...emptyFields, project: project.projectCode, team: team.code }),
    )
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })

    //  Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)

    //  When I complete the form
    page.enterCreditedHours()
    page.enterAppointmentDate('15', '03', '2026')
    page.clickSubmit()

    // Then I should see the next page of the form
    Page.verifyOnPage(ConfirmDetailsPage, courseCompletion)
  })

  // Scenario: Validating the form
  it('validates the form', () => {
    //  Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)

    //  When I submit an invalid form
    page.clickSubmit()

    // Then I should see the page with errors
    Page.verifyOnPage(OutcomePage)
    page.shouldShowErrors()
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    //  Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)

    //  When I click back
    page.clickBack()

    // Then I should see the previous page
    Page.verifyOnPage(AppointmentPage, courseCompletion)
  })
})
