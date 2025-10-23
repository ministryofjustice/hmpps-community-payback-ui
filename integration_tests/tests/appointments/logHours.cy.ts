//  Feature: Update log hours
//    As a case administrator
//    I want to update the log hours on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the log hours page
//    Given I am on the log hours page for an appointment
//    And I do not enter a valid start or end time
//    When I submit the form
//    Then I see the log hours page with errors

//  Scenario: Completing the log hours page
//    Given I am on the log hours page for an appointment
//    And I enter a start and end time
//    When I submit the form
//    Then I see the log compliance page
//
//  Scenario: Returning to the project details page
//    Given I am on the log hours page for an appointment
//    When I click back
//    Then I see the attendance outcome page

import LogHoursPage from '../../pages/appointments/logHoursPage'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import Page from '../../pages/page'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import { contactOutcomesFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'

context('Log hours', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build()
    cy.wrap(appointment).as('appointment')
  })

  beforeEach(function test() {
    cy.task('stubFindAppointment', { appointment: this.appointment })
  })

  // Scenario: Validating the log hours page
  it('validates form data', function test() {
    // Given I am on the log hours page for an appointment
    const page = LogHoursPage.visit(this.appointment)

    // And I do not enter a valid start or end time
    page.enterStartTime('0')
    page.enterEndTime('1')

    // When I submit the form
    page.clickSubmit()

    // Then I see the log hours page with errors
    page.shouldShowErrorSummary('startTime', 'Enter a valid start time, for example 09:00')
    page.shouldShowErrorSummary('endTime', 'Enter a valid end time, for example 17:00')
  })

  // Scenario: Completing the log hours page
  it('submits the form and navigates to the next page', function test() {
    // Given I am on the log hours page for an appointment
    const page = LogHoursPage.visit(this.appointment)

    // And I enter a start and end time
    page.enterStartTime('09:00')
    page.enterEndTime('17:00')

    // When I submit the form
    page.clickSubmit()

    // Then I see the log compliance page
    Page.verifyOnPage(LogCompliancePage, this.appointment)
  })

  //  Scenario: Returning to project details page
  it('navigates back to the previous page', function test() {
    // Given I am on the log hours page for an appointment
    const page = LogHoursPage.visit(this.appointment)

    // When I click back
    cy.task('stubGetContactOutcomes', { contactOutcomes: contactOutcomesFactory.build() })
    page.clickBack()

    // Then I see the attendance outcome page
    Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
  })
})
