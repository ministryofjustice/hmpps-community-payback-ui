//  Feature: Select an appointment
//    As a case admin
//    I want to update an existing pre-scheduled appointment
//    So that I can process the completion against the correct appointment

//  Scenario: Submitting the form
//    Given I am on the form page
//    When I complete the form
//    Then I should see the next page of the form

//  Scenario: Validates the form
//    Given I am on the form page
//    When I submit the form without completing it
//    Then I should see an error

//  Scenario: Navigating back
//    Given I am on the form page
//    When I click back
//    Then I should see the previous page
//
//  Scenario: Creating a new appointment
//    Given I am on the form page
//    When I click create an appointment
//    Then I should see the next page of the form
//
//  Scenario: When there are no pre-scheduled appointments
//    Given there are no pre-scheduled appointments
//    And I am on the form page
//    Then I should see only one CTA and no appointments

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
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    //  Given I am on the form page
    const page = AppointmentPage.visit(courseCompletion)

    //  When I complete the form
    page.selectAppointment(appointmentSummary.id)
    page.clickSubmit()

    // Then I should see the next page of the form
    Page.verifyOnPage(OutcomePage, courseCompletion)
  })

  // Scenario: Validates the form
  it('validates the form', () => {
    //  Given I am on the form page
    const page = AppointmentPage.visit(courseCompletion)

    //  When I submit the form without completing it
    page.clickSubmit()

    // Then I should see an error
    page.shouldShowError()
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

  // Scenario: Creating a new appointment
  it('navigates to next page when creating a new appointment', () => {
    //  Given I am on the form page
    const page = AppointmentPage.visit(courseCompletion)

    //  When I click create an appointment
    page.clickCreateAppointment()

    // Then I should see the next page of the form
    Page.verifyOnPage(OutcomePage, courseCompletion)
  })

  // Scenario: When there are no pre-scheduled appointments
  it('only displays create a new appointment button', () => {
    // Given there are no pre-scheduled appointments
    const emptyPagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: [],
    })
    cy.task('stubGetAppointments', {
      request: {},
      pagedAppointments: emptyPagedAppointments,
    })

    //  And I am on the form page
    const page = AppointmentPage.visit(courseCompletion, 'Create an appointment')

    // Then I should see only one CTA and no appointments
    page.shouldOnlyShowCreateAppointmentButton()
    page.shouldShowNoAppointments()
  })
})
