//  Feature: Select an appointment
//    As a case admin
//    I want to update an existing pre-scheduled appointment
//    So that I can process the completion against the correct appointment

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

import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import Page from '../../../pages/page'

context('Appointment Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const appointmentSummary = appointmentSummaryFactory.build()
  const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
    content: [appointmentSummary],
  })
  const caseDetailsSummary = caseDetailsSummaryFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task(
      'stubGetCourseCompletionForm',
      courseCompletionFormFactory.build({
        crn: caseDetailsSummary.offender.crn,
      }),
    )
    cy.task('stubSaveCourseCompletionForm')

    cy.task('stubGetAppointments', {
      request: {},
      pagedAppointments,
    })
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    //  Given I am on the form page
    const page = AppointmentPage.visit(courseCompletion)

    //  When I complete the form
    page.selectAppointment(appointmentSummary.id)
    page.clickSubmit()

    // Then I should see the next page of the form
    Page.verifyOnPage(OutcomePage, courseCompletion)
  })

  // Scenario: Validating the form
  it('validates the form', () => {
    //  Given I am on the form page
    const page = AppointmentPage.visit(courseCompletion)

    //  When I submit an invalid form
    // And I enter notes
    page.clickSubmit()

    // Then I should see the page with errors
    Page.verifyOnPage(AppointmentPage, courseCompletion)
    page.shouldShowErrors()
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    const teams = providerTeamSummaryFactory.buildList(1)
    const [team] = teams
    const { providerCode } = courseCompletion.pdu
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })
    cy.task(
      'stubGetCourseCompletionForm',
      courseCompletionFormFactory.build({
        team: team.code,
      }),
    )

    //  Given I am on the form page
    const page = AppointmentPage.visit(courseCompletion)

    //  When I click back
    page.clickBack()

    // Then I should see the previous page
    Page.verifyOnPage(ProjectPage, courseCompletion)
  })
})
