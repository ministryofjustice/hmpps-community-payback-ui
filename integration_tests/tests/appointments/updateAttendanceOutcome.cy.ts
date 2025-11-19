//  Feature: Update attendance outcome
//    As a case administrator
//    I want to update the attendance outcome on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the attendance outcome page
//    Given I am on the attendance outcome page for an appointment
//    And I do not select an outcome
//    When I submit the form
//    Then I see the attendance outcome page with errors

//  Scenario: Completing the attendance outcome page
//    Given I am on the attendance outcome page for an appointment
//    And I select an outcome
//    When I submit the form
//    Then I see the log time page
//
//  Scenario: Returning to the project details page
//    Given I am on the attendance outcome page for an appointment
//    When I click back
//    Then I see the project details page

import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import Page from '../../pages/page'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import { contactOutcomesFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'

context('Attendance outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build({ id: 1001 })
    cy.wrap(appointment).as('appointment')

    const contactOutcomes = contactOutcomesFactory.build()
    cy.wrap(contactOutcomes).as('contactOutcomes')
  })

  beforeEach(function test() {
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetContactOutcomes', { contactOutcomes: this.contactOutcomes })
  })

  // Scenario: Validating the attendance outcome page
  it('validates form data', function test() {
    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // And I do not select an outcome
    // When I submit the form
    page.clickSubmit()

    // Then I see the attendance outcome page with errors
    page.shouldShowErrorSummary('attendanceOutcome', 'Select an attendance outcome')
  })

  // Scenario: Completing the attendance outcome page
  it('submits the form and navigates to the next page', function test() {
    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // And I select an outcome
    page.selectOutcome(this.contactOutcomes.contactOutcomes[0].code)

    cy.task('stubGetForm', {})
    cy.task('stubSaveForm')
    // When I submit the form
    page.clickSubmit()

    // Then I see the log time page
    Page.verifyOnPage(LogHoursPage, this.appointment)
  })

  //  Scenario: Returning to project details page
  it('navigates back to the previous page', function test() {
    const supervisors = supervisorSummaryFactory.buildList(2)

    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // When I click back
    cy.task('stubGetSupervisors', {
      teamCode: this.appointment.supervisingTeamCode,
      providerCode: this.appointment.providerCode,
      supervisors,
    })
    page.clickBack()

    // Then I see the project details page
    Page.verifyOnPage(CheckProjectDetailsPage, this.appointment)
  })
})
