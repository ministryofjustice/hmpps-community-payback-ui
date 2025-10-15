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
import LogTimePage from '../../pages/appointments/logTimePage'
import { contactOutcomesFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'

context('Attendance outcome', () => {
  const contactOutcomes = contactOutcomesFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  // Scenario: Validating the attendance outcome page
  it('validates form data', () => {
    // Given I am on the attendance outcome page for an appointment
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    const page = AttendanceOutcomePage.visit()

    // And I do not select an outcome
    // When I submit the form
    page.clickSubmit()

    // Then I see the attendance outcome page with errors
    page.shouldShowErrorSummary('attendanceOutcome', 'Select an attendance outcome')
  })

  // Scenario: Completing the attendance outcome page
  it('submits the form and navigates to the next page', () => {
    // Given I am on the attendance outcome page for an appointment
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    const page = AttendanceOutcomePage.visit()

    // And I select an outcome
    page.selectOutcome(contactOutcomes.contactOutcomes[0].id)

    // When I submit the form
    page.clickSubmit()

    // Then I see the log time page
    Page.verifyOnPage(LogTimePage)
  })

  //  Scenario: Returning to project details page
  it('navigates back to the previous page', () => {
    // Given I am on the attendance outcome page for an appointment
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    const page = AttendanceOutcomePage.visit()

    // When I click back
    cy.task('stubFindAppointment')
    cy.task('stubGetSupervisors')
    page.clickBack()

    // Then I see the project details page
    Page.verifyOnPage(CheckProjectDetailsPage)
  })
})
