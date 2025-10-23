//  Feature: Update log compliance
//    As a case administrator
//    I want to update the log compliance on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the log compliance page
//    Given I am on the log compliance page for an appointment
//    And I do not complete the form
//    When I submit the form
//    Then I see the log compliance page with errors

//  Scenario: Completing the log compliance page
//    Given I am on the log compliance page for an appointment
//    And I complete the form
//    When I submit the form
//    Then I see the confirm details page
//
//  Scenario: Returning to the log hours page
//    Given I am on the log compliance page for an appointment
//    When I click back
//    Then I see the log hours page

import LogHoursPage from '../../pages/appointments/logHoursPage'
import Page from '../../pages/page'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'

context('Log compliance', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build()
    cy.wrap(appointment).as('appointment')
  })

  // Scenario: Validating the log compliance page
  it('validates form data', () => {
    const appointment = appointmentFactory.build({
      attendanceData: {
        hiVisWorn: null,
        workedIntensively: null,
        workQuality: null,
        behaviour: null,
      },
    })
    // Given I am on the log compliance page for an appointment
    cy.task('stubFindAppointment', { appointment })
    const page = LogCompliancePage.visit(appointment)

    // And I do not complete the form

    // When I submit the form
    page.clickSubmit()

    // Then I see the log compliance page with errors
    page.shouldShowErrorSummary('hiVis', 'Select whether a Hi-Vis was worn')
    page.shouldShowErrorSummary('workedIntensively', 'Select whether they worked intensively')
    page.shouldShowErrorSummary('workQuality', 'Select their work quality')
    page.shouldShowErrorSummary('behaviour', 'Select their behaviour')
  })

  // Scenario: Completing the log compliance page
  it('submits the form and navigates to the next page', function test() {
    // Given I am on the log compliance page for an appointment
    cy.task('stubFindAppointment', { appointment: this.appointment })
    const page = LogCompliancePage.visit(this.appointment)

    // When I submit the form
    page.clickSubmit()

    // Then I see the confirm details page
    Page.verifyOnPage(ConfirmDetailsPage, this.appointment)
  })

  //  Scenario: Returning to log hours page
  it('navigates back to the previous page', function test() {
    // Given I am on the log compliance page for an appointment
    cy.task('stubFindAppointment', { appointment: this.appointment })
    const page = LogCompliancePage.visit(this.appointment)

    // When I click back
    page.clickBack()

    // Then I see the log hours page
    Page.verifyOnPage(LogHoursPage, this.appointment)
  })
})
