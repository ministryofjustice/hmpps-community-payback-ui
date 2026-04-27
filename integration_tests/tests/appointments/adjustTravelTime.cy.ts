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

//  Scenario: navigating through paginated results
//    Given I am on the 'Adjust travel time' page
//    When I complete the search form
//    And I click submit
//    And there are multiple pages of results
//    Then I see pagination controls
//    When I click to the next page of results
//    Then I see the next page of results

//  Scenario: Updating travel time
//    Given I am on the adjust travel time page for an appointment
//    When I complete the form
//    Then I see the travel time dashboard with a success message

//  Scenario: Validating input
//    Given I am on the adjust travel time page for an appointment
//    When I do not complete the form
//    And I click submit
//    Then I should see the page with errors

//  Scenario: Showing submit errors
//    Given I am on the adjust travel time page for an appointment
//    When I complete the form
//    And I submit
//    And the API returns a 400 error
//    Then I can see the error message

//  Scenario: Saving not eligible for travel time
//    Given I am on the adjust travel time page for an appointment
//    When I click not eligible for travel time
//    Then I see the travel time dashboard with a success message

import { ContactOutcomeDto, ProjectDto } from '../../../server/@types/shared'
import { ProviderSummaryDto } from '../../../server/@types/shared/models/ProviderSummaryDto'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentTaskSummaryFactory from '../../../server/testutils/factories/appointmentTaskSummaryFactory'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import pagedMetadataFactory from '../../../server/testutils/factories/pagedMetadataFactory'
import pagedModelAppointmentTaskSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentTaskSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import SearchAttendedPage from '../../pages/appointments/searchAttendedPage'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import Page from '../../pages/page'

context('Update travel time page', () => {
  const appointment = appointmentFactory.build()
  let providers: Array<ProviderSummaryDto>
  let provider: ProviderSummaryDto
  let contactOutcome: ContactOutcomeDto
  let project: ProjectDto

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindAppointment', { appointment })

    providers = providerSummaryFactory.buildList(2)
    ;[provider] = providers
    cy.task('stubGetProviders', { providers: { providers } })
    contactOutcome = contactOutcomeFactory.build({ code: appointment.contactOutcomeCode })
    const contactOutcomes = [contactOutcome, contactOutcomeFactory.build()]
    cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes } })
    project = projectFactory.build({ projectCode: appointment.projectCode })
    cy.task('stubFindProject', { project })
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

  // Scenario: navigating through paginated results
  it('shows pagination controls and allows navigating to next page of results', function test() {
    const appointmentTasks = appointmentTaskSummaryFactory.buildList(11)
    const appointmentResponse = pagedModelAppointmentTaskSummaryFactory.build({
      content: appointmentTasks,
      page: pagedMetadataFactory.build({
        size: 10,
        number: 0,
        totalElements: 11,
        totalPages: 2,
      }),
    })
    cy.task('stubGetAppointmentTasks', { providerCode: provider.code, page: 1, appointments: appointmentResponse })

    // Given I am on the 'Adjust travel time' page
    SearchAttendedPage.visit()
    const page = Page.verifyOnPage(SearchAttendedPage)

    // When I complete the search form
    page.selectRegion(provider)

    // And I click submit
    page.clickFilter()

    // Then I see pagination controls
    page.appointmentsTable.shouldShowPaginationControls()

    // When I click to the next page of results
    const nextAppointmentTasks = appointmentTaskSummaryFactory.buildList(11)
    const nextAppointmentResponse = pagedModelAppointmentTaskSummaryFactory.build({
      content: nextAppointmentTasks,
      page: pagedMetadataFactory.build({
        size: 10,
        number: 1,
        totalElements: 11,
        totalPages: 2,
      }),
    })

    cy.task('stubGetAppointmentTasks', { providerCode: provider.code, page: 2, appointments: nextAppointmentResponse })

    page.clickNextPage()

    // Then I see the next page of results
    page.shouldShowAttendedAppointments(nextAppointmentTasks)
  })

  // Scenario: Updating travel time
  it('submits travel time and returns to dashboard', () => {
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment)
    page.shouldShowAppointmentDetails(contactOutcome.name, project)

    //  When I complete the form
    page.timeInput.enterTime()

    cy.task('stubSaveAdjustment', { appointment })
    cy.task('stubGetAdjustmentReasons')
    page.clickSubmit()

    // Then I see the travel time dashboard with a success message
    const searchPage = Page.verifyOnPage(SearchAttendedPage)
    searchPage.shouldShowSuccessBanner(appointment)
  })

  // Scenario: Updating travel time and returning to search
  it('submits travel time and returns to dashboard with search results', () => {
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment, '1', { provider: provider.code })
    page.shouldShowAppointmentDetails(contactOutcome.name, project)

    //  When I complete the form
    page.timeInput.enterTime()

    // And I submit

    cy.task('stubSaveAdjustment', { appointment })
    cy.task('stubGetAdjustmentReasons')
    const nextAppointmentTasks = appointmentTaskSummaryFactory.buildList(11)
    const nextAppointmentResponse = pagedModelAppointmentTaskSummaryFactory.build({
      content: nextAppointmentTasks,
      page: pagedMetadataFactory.build({
        size: 10,
        number: 1,
        totalElements: 11,
        totalPages: 2,
      }),
    })

    cy.task('stubGetAppointmentTasks', { providerCode: provider.code, page: 2, appointments: nextAppointmentResponse })

    page.clickSubmit()

    // Then I see the travel time dashboard with a success message
    const searchPage = Page.verifyOnPage(SearchAttendedPage)
    searchPage.shouldShowSuccessBanner(appointment)
    searchPage.shouldShowAttendedAppointments()
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

  // Scenario: Showing submit errors
  it('renders an error message when submission fails with a 400 error', () => {
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment)

    //  When I complete the form
    page.timeInput.enterTime()

    cy.task('stubGetAdjustmentReasons')

    const userMessage = 'Invalid adjustment data'
    cy.task('stubSaveAdjustmentWithError', {
      appointment,
      userMessage,
    })

    // And I submit
    // And the API returns a 400 error
    page.clickSubmit()

    // Then I can see the error message
    page.checkOnPage()
    page.shouldShowErrorSummary(userMessage)
  })

  // Scenario: Saving not eligible for travel time
  it('completes the task when selecting not eligible for travel time', () => {
    const taskId = '12'
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment, taskId)

    cy.task('stubCompleteAppointmentTask', { taskId })
    // When I click not eligible for travel time
    page.clickNotEligible()

    // Then I see the travel time dashboard with a success message
    const searchPage = Page.verifyOnPage(SearchAttendedPage)
    searchPage.shouldShowNotEligibleRecordedSuccessBanner(appointment)
  })

  // Scenario: Saving not eligible for travel time and returning to search
  it('completes the task and returns to the search results', () => {
    const taskId = '12'
    // Given I am on the adjust travel time page for an appointment
    const page = UpdateTravelTimePage.visit(appointment, taskId, { provider: provider.code })

    cy.task('stubCompleteAppointmentTask', { taskId })
    const nextAppointmentTasks = appointmentTaskSummaryFactory.buildList(11)
    const nextAppointmentResponse = pagedModelAppointmentTaskSummaryFactory.build({
      content: nextAppointmentTasks,
      page: pagedMetadataFactory.build({
        size: 10,
        number: 1,
        totalElements: 11,
        totalPages: 2,
      }),
    })
    cy.task('stubGetAppointmentTasks', { providerCode: provider.code, page: 2, appointments: nextAppointmentResponse })
    // When I click not eligible for travel time
    page.clickNotEligible()

    // Then I see the travel time dashboard with a success message
    const searchPage = Page.verifyOnPage(SearchAttendedPage)
    searchPage.shouldShowNotEligibleRecordedSuccessBanner(appointment)
  })
})
