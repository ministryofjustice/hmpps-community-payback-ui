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

//  Scenario: Completing the log compliance page - enforcement required
//    Given I am on the log compliance page for an appointment for which I have previously recorded an enforceable contact outcome
//    When I submit the form
//    Then I see the enforcement pages

//  Scenario: Returning to the log hours page
//    Given I am on the log compliance page for an appointment
//    When I click back
//    Then I see the log hours page

import LogHoursPage from '../../pages/appointments/logHoursPage'
import Page from '../../pages/page'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import { AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import EnforcementPage from '../../pages/appointments/enforcementPage'

context('Log compliance', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build({})
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

  describe('submit', function describe() {
    // Scenario: Completing the log compliance page
    it('submits the form and navigates to the next page', function test() {
      // Given I am on the log compliance page for an appointment
      cy.task('stubFindAppointment', { appointment: this.appointment })
      const page = LogCompliancePage.visit(this.appointment)

      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ enforceable: false }),
      })

      cy.task('stubGetForm', form)
      cy.task('stubSaveForm')
      // When I submit the form
      page.clickSubmit()

      // Then I see the confirm details page
      const confirmPage = Page.verifyOnPage(ConfirmDetailsPage, this.appointment)
      confirmPage.shouldShowFormTitle()
    })

    // Scenario: Entering enforcement action details
    it('should navigate user to enforcement page if they have previously selected a contact outcome with enforcement', function test() {
      // Given I am on the log compliance page for an appointment for which I have previously recorded an enforceable contact outcome
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetEnforcementActions', { enforcementActions: this.enforcementActions })
      const page = LogCompliancePage.visit(this.appointment)

      const form: AppointmentOutcomeForm = {
        contactOutcome: contactOutcomeFactory.build({ enforceable: true }),
      }

      cy.task('stubGetForm', form)
      cy.task('stubSaveForm')
      // When I submit the form
      page.clickSubmit()

      // Then I see the enforcement page
      const enforcementPage = Page.verifyOnPage(EnforcementPage, this.appointment)
      enforcementPage.shouldShowQuestions()
    })
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
