//  Feature: Update log compliance
//    As a case administrator
//    I want to update the log compliance on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Entering enforcement action details
//    Given I am on the log compliance page for an appointment for which I have previously recorded an enforceable contact outcome
//    When I submit the form
//    Then I see the enforcement pages

//  Scenario: Validating the form page
//    Given I am on an the enforcement actions form page
//    And I do not select an enforcement action
//    When I submit the form
//    Then I see the same page with errors

import Page from '../../pages/page'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import { AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import enforcementActionFactory from '../../../server/testutils/factories/enforcementActionFactory'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'

context('Log compliance', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build()
    cy.wrap(appointment).as('appointment')

    const enforcementActions = { enforcementActions: enforcementActionFactory.buildList(2) }
    cy.wrap(enforcementActions).as('enforcementActions')
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

context('Log enforcement', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const enforcementActions = { enforcementActions: enforcementActionFactory.buildList(2) }
    cy.wrap(enforcementActions).as('enforcementActions')
  })

  //  Scenario: Validating the form page
  it('validates form data', function test() {
    // Given I am on an the enforcement actions form page
    const appointmentWithoutEnforcement = appointmentFactory.build({ enforcementData: undefined })

    cy.task('stubFindAppointment', { appointment: appointmentWithoutEnforcement })
    cy.task('stubGetEnforcementActions', { enforcementActions: this.enforcementActions })
    const page = EnforcementPage.visit(appointmentWithoutEnforcement)

    // And I do not select an enforcement action
    // And I clear the respondBy date
    page.respondByInput.clear()
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('enforcement', 'Select an enforcement action')
    page.shouldShowErrorSummary('respondBy-day', 'The date to respond by must include a day, month and year')
  })
})
