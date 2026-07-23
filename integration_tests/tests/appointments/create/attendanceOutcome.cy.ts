//  Feature: Log attendance for a new appointment
//    As a case administrator
//    I want to log the attendance outcome when creating a new appointment
//    So that I can track progress for an unpaid work order

// Scenario: Validating the attendance outcome page
//    Given I am on the attendance outcome page for a new appointment
//    And I do not select an outcome
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the attendance outcome page for a new appointment
//    And I select an attended outcome
//    When I submit the form
//    Then I see the log hours page

// Scenario: can complete the form for a non-attended outcome
//    Given I am on the attendance outcome page for a new appointment
//    And I select a non-attended outcome
//    When I submit the form
//    Then I see the confirm details page

// Scenario: can navigate back to the previous page
//    Given I am on the attendance outcome page for a new appointment
//    When I click back
//    Then I see the choose project page

import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import projectOutcomeSummaryFactory from '../../../../server/testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import ChooseProjectPage from '../../../pages/appointments/chooseProjectPage'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'

context('Create appointment - Attendance outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({ crn: offender.crn })
    cy.wrap(form).as('form')

    const contactOutcomes = contactOutcomesFactory.build()
    cy.wrap(contactOutcomes).as('contactOutcomes')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
    cy.task('stubGetContactOutcomes', { contactOutcomes })
  })

  // Scenario: Validating the attendance outcome page
  it('shows validation messages', function test() {
    // Given I am on the attendance outcome page for a new appointment
    const page = AttendanceOutcomePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I do not select an outcome
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('attendanceOutcome', 'Select an attendance outcome')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    const attendedOutcome = contactOutcomeFactory.build({ attended: true })
    cy.task('stubGetContactOutcomes', {
      contactOutcomes: contactOutcomesFactory.build({ contactOutcomes: [attendedOutcome] }),
    })
    cy.task('stubSaveAppointmentForm')

    // Given I am on the attendance outcome page for a new appointment
    const page = AttendanceOutcomePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I select an attended outcome
    page.completeForm(attendedOutcome.code)

    // When I submit the form
    page.clickSubmit()

    // Then I see the log hours page
    Page.verifyOnPage(LogHoursPage, { offender: this.offender })
  })

  // Scenario: can complete the form for a non-attended outcome
  it('can submit the form and continue to confirm details when not attended', function test() {
    const notAttendedOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
    cy.task('stubGetContactOutcomes', {
      contactOutcomes: contactOutcomesFactory.build({ contactOutcomes: [notAttendedOutcome] }),
    })
    cy.task('stubSaveAppointmentForm')

    // Given I am on the attendance outcome page for a new appointment
    const page = AttendanceOutcomePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I select a non-attended outcome
    page.completeForm(notAttendedOutcome.code)

    // When I submit the form
    page.clickSubmit()

    // Then I see the confirm details page
    Page.verifyOnPage(ConfirmDetailsPage, { offender: this.offender })
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    const team = providerTeamSummaryFactory.build({ code: this.form.projectTeam.code })
    const selectedProject = projectOutcomeSummaryFactory.build({
      projectCode: this.form.project.code,
      projectName: this.form.project.name,
    })

    cy.task('stubFindProject', { project: this.project })
    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: this.project.providerCode })
    cy.task('stubGetProjects', {
      projects: { content: [selectedProject] },
      teamCode: this.form.projectTeam.code,
      providerCode: this.project.providerCode,
    })

    // Given I am on the attendance outcome page for a new appointment
    const page = AttendanceOutcomePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // When I click back
    page.clickBack()

    // Then I see the choose project page
    Page.verifyOnPage(ChooseProjectPage, { offender: this.offender })
  })
})
