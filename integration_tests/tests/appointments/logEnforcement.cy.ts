//  Feature: Update log compliance
//    As a case administrator
//    I want to update the log compliance on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the form page
//    Given I am on an the enforcement actions form page
//    And I clear the respond by date
//    When I submit the form
//    Then I see the same page with errors

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import { enforcementActionFactory } from '../../../server/testutils/factories/enforcementActionFactory'

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

    // And I clear the respond by date
    page.respondByInput.clear()
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('respondBy-day', 'The date to respond by must include a day, month and year')
  })
})
