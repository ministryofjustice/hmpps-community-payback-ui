//  Feature: Update log hours
//    As a case administrator
//    I want to update the log hours on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the log hours page
//    Given I am on the log hours page for an appointment
//    And I do not enter a valid start or end time
//    When I submit the form
//    Then I see the log hours page with errors

//  Scenario: Scenario: Completing the log hours page - attended
//    Given I am on the log hours page for an appointment with an attended outcome
//    And I enter a start and end time
//    When I submit the form
//    Then I see the log compliance page

//  Scenario: Scenario: Completing the log hours page - not attended + enforceable
//    Given I am on the log hours page for an appointment with a not attended and enforceable outcome
//    And I enter a start and end time
//    When I submit the form
//    Then I see the confirm page

//  Scenario: Scenario: Completing the log hours page - not attended
//    Given I am on the log hours page for an appointment with a not attended outcome
//    And I enter a start and end time
//    When I submit the form
//    Then I see the confirm page

//  Scenario: Returning to the project details page
//    Given I am on the log hours page for an appointment
//    When I click back
//    Then I see the attendance outcome page

import LogHoursPage from '../../pages/appointments/logHoursPage'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import Page from '../../pages/page'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import EnforcementPage from '../../pages/appointments/enforcementPage'

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

  describe('Submit', function action() {
    // Scenario: Completing the log hours page - attended
    describe('attended', function describe() {
      it('submits the form and navigates to log compliance', function test() {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
        })

        // Given I am on the log hours page for an appointment with an attended outcome
        cy.task('stubGetForm', form)
        const page = LogHoursPage.visit(this.appointment)

        // And I enter a start and end time
        page.enterStartTime('09:00')
        page.enterEndTime('17:00')

        cy.task('stubSaveForm')
        // When I submit the form
        page.clickSubmit()

        // Then I see the log compliance page
        Page.verifyOnPage(LogCompliancePage, this.appointment)
      })
    })

    describe('did not attend', function describe() {
      // Scenario: Completing the log hours page - not attended + enforceable
      it('enforceable =>  submits the form and navigates to enforcement page', function test() {
        // Given I am on the log hours page for an appointment with a not attended and enforceable outcome
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false, enforceable: true }),
        })
        cy.task('stubGetForm', form)

        const page = LogHoursPage.visit(this.appointment)

        // And I enter a start and end time
        page.enterStartTime('09:00')
        page.enterEndTime('17:00')

        cy.task('stubSaveForm')
        // When I submit the form
        page.clickSubmit()

        // Then I see the log compliance page
        Page.verifyOnPage(EnforcementPage, this.appointment)
      })

      // Scenario: Completing the log hours page - not attended
      it('not enforceable => submits the form and navigates to confirm page', function test() {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false, enforceable: false }),
        })

        // Given I am on the log hours page for an appointment with a not attended outcome
        cy.task('stubGetForm', form)
        const page = LogHoursPage.visit(this.appointment)

        // And I enter a start and end time
        page.enterStartTime('09:00')
        page.enterEndTime('17:00')

        cy.task('stubSaveForm')
        // When I submit the form
        page.clickSubmit()

        // Then I see the confirm details page
        Page.verifyOnPage(ConfirmDetailsPage, this.appointment)
      })
    })
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
