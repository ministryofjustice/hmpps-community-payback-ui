//  Feature: Adjust travel time for an appointment
//    As a case administrator
//    I want to adjust travel time for an appointment
//    So that I can correctly track all time completed for an unpaid work order

//  Scenario: viewing the 'Adjust travel time' page
//    When I visit the 'Adjust travel time' page
//    Then I see the filter form

//  Scenario: searching for attended appointments
//    When I visit the 'Adjust travel time' page
//    And I select a region
//    And I submit the form
//    Then I should see a list of attended appointments

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
import pagedModelAppointmentTaskSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentTaskSummaryFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import SearchAttendedPage from '../../pages/appointments/searchAttendedPage'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import Page from '../../pages/page'

context('Update travel time page', () => {
  const appointment = appointmentFactory.build()
  let providers: Array<ProviderSummaryDto>
  let provider: ProviderSummaryDto

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindAppointment', { appointment })

    providers = providerSummaryFactory.buildList(2)
    ;[provider] = providers
    cy.task('stubGetProviders', { providers: { providers } })
  })

  // Scenario: viewing the 'Adjust travel time' page
  it('shows the find an individual placement page', () => {
    // When I visit the 'Adjust travel time' page
    SearchAttendedPage.visit()
    const page = Page.verifyOnPage(SearchAttendedPage)

    // Then I see the search form
    page.shouldShowSearchForm()
  })

  // Scenario: searching for attended appointments
  it('searches for attended appointments and displays results', () => {
    const appointments = pagedModelAppointmentTaskSummaryFactory.build()
    cy.task('stubGetAppointmentTasks', { providerCode: provider.code, appointments })

    // When I visit the 'Adjust travel time' page
    SearchAttendedPage.visit()
    const page = Page.verifyOnPage(SearchAttendedPage)

    // And I select a region
    page.selectRegion(provider)

    // And I submit the form
    page.clickFilter()

    // Then I should see a list of attended appointments
    page.shouldShowAttendedAppointments()
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
