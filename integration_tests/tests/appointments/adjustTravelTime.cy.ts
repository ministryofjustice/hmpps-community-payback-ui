//  Feature: Adjust travel time for an appointment
//    As a case administrator
//    I want to adjust travel time for an appointment
//    So that I can correctly track all time completed for an unpaid work order

//  Scenario: Updating travel time
//    Given I am on the adjust travel time page for an appointment
//    When I complete the form
//    Then I see the travel time dashboard

//  Scenario: Validating input
//    Given I am on the adjust travel time page for an appointment
//    When I do not complete the form
//    And I click submit
//    Then I should see the page with errors

import { ProviderSummaryDto } from '../../../server/@types/shared/models/ProviderSummaryDto'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import SearchAttendedPage from '../../pages/appointments/searchAttendedPage'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import Page from '../../pages/page'

context('Update travel time page', () => {
  const appointment = appointmentFactory.build()
  let providers: Array<ProviderSummaryDto>

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindAppointment', { appointment })

    providers = providerSummaryFactory.buildList(2)
    cy.task('stubGetProviders', { providers: { providers } })
  })

  // Scenario: Updating travel time
  it('submits travel time and returns to dashboard', () => {
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment)

    //  When I complete the form
    page.timeInput.enterTime()
    page.clickSubmit()

    // Then I see the travel time dashboard
    Page.verifyOnPage(SearchAttendedPage)
  })

  // Scenario: Validating input
  it('shows validation errors', () => {
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment)

    // When I do not complete the form
    // And I click submit
    page.clickSubmit()

    // Then I should see the page with errors
    page.checkOnPage()
    page.timeInput.shouldShowMissingValueError()
  })
})
