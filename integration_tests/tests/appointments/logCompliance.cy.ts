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

context('Log hours', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  // Scenario: Validating the log compliance page
  it.only('validates form data', () => {
    const appointment = appointmentFactory.build({ attendanceData: { hiVisWorn: null } })
    // Given I am on the log compliance page for an appointment
    cy.task('stubFindAppointment', { appointmentId: '1001', appointment })
    const page = LogCompliancePage.visit()

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
  it('submits the form and navigates to the next page', () => {
    // Given I am on the log compliance page for an appointment
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    const page = LogCompliancePage.visit()

    // When I submit the form
    page.clickSubmit()

    // Then I see the confirm details page
    Page.verifyOnPage(ConfirmDetailsPage)
  })

  //  Scenario: Returning to log hours page
  it('navigates back to the previous page', () => {
    // Given I am on the log compliance page for an appointment
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    const page = LogCompliancePage.visit()

    // When I click back
    cy.task('stubFindAppointment')
    page.clickBack()

    // Then I see the log hours page
    Page.verifyOnPage(LogHoursPage)
  })
})
