//  Feature: Update log compliance
//    As a case administrator
//    I want to update the log compliance on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the form page
//    Given I am on an the enforcement actions form page
//    And I clear the respond by date
//    When I submit the form
//    Then I see the same page with errors

//  Scenario: submitting enforcement page
//    Given I am on an the enforcement actions form page
//    When I submit the form
//    Then I see the confirm page

//  Scenario: navigating back
//    Scenario: appointment was attended
//    Given I am on an the enforcement actions form page for an appointment which was attended
//    When I submit the form
//    Then I see the compliance form page

//    Scenario: appointment was not attended
//    Given I am on an the enforcement actions form page for an appointment which was not attended
//    When I submit the form
//    Then I see the log hours form page

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import { enforcementActionsFactory } from '../../../server/testutils/factories/enforcementActionFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import Page from '../../pages/page'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../pages/appointments/logHoursPage'

context('Log enforcement', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const enforcementActions = enforcementActionsFactory.build()
    cy.wrap(enforcementActions).as('enforcementActions')
  })

  //  Scenario: Validating the form page
  it('validates form data', function test() {
    const form = appointmentOutcomeFormFactory.build()
    // Given I am on an the enforcement actions form page
    const appointmentWithoutEnforcement = appointmentFactory.build({ enforcementData: undefined })

    cy.task('stubFindAppointment', { appointment: appointmentWithoutEnforcement })
    cy.task('stubGetEnforcementActions', { enforcementActions: this.enforcementActions })
    cy.task('stubGetForm', form)
    const page = EnforcementPage.visit(appointmentWithoutEnforcement)

    // And I clear the respond by date
    page.respondByInput.clear()
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('respondBy-day', 'The date to respond by must include a day, month and year')
  })

  // Scenario: submitting enforcement page
  describe('submit', function action() {
    it('continues to confirm page', function test() {
      const form = appointmentOutcomeFormFactory.build()
      // Given I am on an the enforcement actions form page
      const appointment = appointmentFactory.build()

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetEnforcementActions', { enforcementActions: this.enforcementActions })
      cy.task('stubGetForm', form)
      cy.task('stubSaveForm')
      const page = EnforcementPage.visit(appointment)

      // When I submit the form
      page.clickSubmit()

      // Then I see the confirm page
      Page.verifyOnPage(ConfirmDetailsPage, appointment)
    })
  })

  // Scenario: navigating back
  describe('back', function action() {
    // Scenario: appointment was attended
    it('attended => navigates to compliance', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })
      // Given I am on an the enforcement actions form page for an appointment which was attended
      const appointment = appointmentFactory.build()

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetEnforcementActions', { enforcementActions: this.enforcementActions })
      cy.task('stubGetForm', form)
      const page = EnforcementPage.visit(appointment)

      // When I submit the form
      page.clickBack()

      // Then I see the the compliance form page
      Page.verifyOnPage(LogCompliancePage, appointment)
    })

    // Scenario: appointment was not attended
    it('did not attend => navigates to log hours', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: false }),
      })

      // Given I am on an the enforcement actions form page
      const appointment = appointmentFactory.build()

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetEnforcementActions', { enforcementActions: this.enforcementActions })
      cy.task('stubGetForm', form)
      const page = EnforcementPage.visit(appointment)

      // When I submit the form
      page.clickBack()

      // Then I see the log hours form page
      Page.verifyOnPage(LogHoursPage, appointment)
    })
  })
})
