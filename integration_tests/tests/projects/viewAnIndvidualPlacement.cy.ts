//  Feature: View an independent placement project
//    As a case admin
//    So that I can report on people's progress on a single project
//    I want to view details about a project
//    And view any missing outcomes I need to capture
//
//  Scenario: Viewing and updating an individual placement's appointments
//    Given I am on the project page
//    When I click on 'Update' for an appointment
//    Then I should see the start of the appointment update journey
//
//  Scenario: viewing an appointments page for an offender in a project
//    Given I am on the project page
//    When I click on the name link for an offender
//    Then I should see the view appointments page for that CRN
//
//  Scenario: navigating back from an individual placement
//    Given I am on the project page
//    When I click on the back link
//    Then I should see the individual placements search page
//
//  Scenario: Adding a new appointment
//    Given I am on the project page
//    When I click on the 'Add an appointment' link
//    Then I should see the find a person page

//  Scenario: switching between tabs on the project page
//    Given I am on the project page
//    When I click on the 'Past appointments' tab
//    Then I should see the appointments with outcomes
//    When I click on the next page link
//    Then I should see the next page of appointments with outcomes
//    When I click on the 'Missing outcomes' tab
//    Then I should see the appointments with missing outcomes

import ProjectPage from '../../pages/projects/projectPage'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import Page from '../../pages/page'
import FindIndividualPlacementPage from '../../pages/projects/findIndividualPlacementPage'
import { baseProjectAppointmentRequest } from '../../mockApis/projects'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import Utils from '../../utils'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../server/testutils/factories/providerTeamSummaryFactory'
import FindAPersonPage from '../../pages/findAPersonPage'
import ViewAppointmentsPage from '../../pages/appointments/viewAppointmentsPage'
import Offender from '../../../server/models/offender'
import { AppointmentSummaryDto } from '../../../server/@types/shared'

context('Project page', () => {
  const project = projectFactory.build()
  const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindProject', { project })
    const request = { ...baseProjectAppointmentRequest(), projectCodes: [project.projectCode] }
    cy.task('stubGetAppointments', { request, pagedAppointments })
  })

  //  Scenario: Viewing and updating an individual placement's appointments
  it('shows project details', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)
    page.shouldShowProjectDetails()
    page.shouldShowAppointments(pagedAppointments.content)

    // When I click on 'Update' for an appointment
    const [selected] = pagedAppointments.content
    const appointment = appointmentFactory.build({
      projectCode: project.projectCode,
      id: selected.id,
      contactOutcomeCode: undefined,
    })
    const supervisors = supervisorSummaryFactory.buildList(2)

    Utils.stubOffenderFromAppointment(appointment)

    cy.task('stubFindAppointment', { appointment })
    cy.task('stubGetSupervisors', {
      teamCode: appointment.supervisingTeamCode,
      providerCode: appointment.providerCode,
      supervisors,
    })
    cy.task('stubSaveAppointmentForm')

    page.clickUpdateAnAppointment()

    // Then I should see the start of the appointment update journey
    Page.verifyOnPage(CheckAppointmentDetailsPage, appointment)
  })

  // Scenario: viewing an appointments page for an offender in a project
  it('allows navigation through to the view appointments page', () => {
    // Given I am on the project page
    const page = ProjectPage.visit(project)
    page.shouldShowProjectDetails()
    page.shouldShowAppointments(pagedAppointments.content || [])

    const [summary] = pagedAppointments.content as AppointmentSummaryDto[]

    const appointment = appointmentFactory.build({
      id: summary.id,
      projectCode: summary.projectCode,
      offender: summary.offender,
    })

    const request = {
      crn: appointment.offender.crn,
      eventNumber: appointment.deliusEventNumber,
    }

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubFindAppointment', { appointment })

    const stubbedOffender = Utils.stubOffenderFromAppointment(appointment)

    // When I click on the name link for an offender
    page.clickNameLink(appointment.offender)

    // Then I should see the view appointments page for that CRN
    Page.verifyOnPage(ViewAppointmentsPage, new Offender(stubbedOffender))
  })

  //  Scenario: navigating back from an individual placement
  it('allows navigation back to individual placement search', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)
    const provider = providerSummaryFactory.build()
    cy.task('stubGetProviders', { providers: { providers: [provider] } })

    // When I click on the back link
    cy.task('stubGetTeams', {
      teams: { providers: providerTeamSummaryFactory.buildList(2) },
      providerCode: provider.code,
    })
    page.clickBack()

    // Then I should see the individual placements search page
    Page.verifyOnPage(FindIndividualPlacementPage)
  })

  //  Scenario: Adding a new appointment
  it('allows adding a new appointment', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)
    //  When I click on the 'Add an appointment' link
    page.clickAddAnAppointment()
    //  Then I should see the find a person page
    Page.verifyOnPage(FindAPersonPage)
  })

  //  Scenario: switching between tabs on the project page
  it('allows switching between the missing outcomes and past appointments tabs', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)
    page.shouldShowAppointments(pagedAppointments.content)

    const pastAppointments = pagedModelAppointmentSummaryFactory.build({ page: { totalPages: 2, totalElements: 19 } })
    const pastAppointmentsPage2 = pagedModelAppointmentSummaryFactory.build({
      page: { totalPages: 2, totalElements: 19 },
    })
    const request = {
      ...baseProjectAppointmentRequest(),
      outcomeCodes: ['WITH_OUTCOME'],
      projectCodes: [project.projectCode],
    }
    cy.task('stubGetAppointments', { request: { ...request, page: 0 }, pagedAppointments: pastAppointments })
    cy.task('stubGetAppointments', { request: { ...request, page: 1 }, pagedAppointments: pastAppointmentsPage2 })

    // When I click on the 'Past appointments' tab
    page.clickPastAppointmentsTab()

    // Then I should see the appointments with outcomes
    page.shouldShowAppointments(pastAppointments.content)

    // When I click on the next page link
    page.pagination.clickNext()

    // Then I should see the next page of appointments with outcomes
    page.shouldShowAppointments(pastAppointmentsPage2.content)

    // When I click on the 'Missing outcomes' tab
    page.clickMissingOutcomesTab()

    // Then I should see the appointments with missing outcomes again
    page.shouldShowAppointments(pagedAppointments.content)
  })
})
