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
//  Scenario: navigating back from an individual placement
//    Given I am on the project page
//    When I click on the back link
//    Then I should see the individual placements search page

import ProjectPage from '../../pages/projects/projectPage'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import Page from '../../pages/page'
import FindIndividualPlacementPage from '../../pages/projects/findIndividualPlacementPage'
import { baseProjectAppointmentRequest } from '../../mockApis/projects'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import Utils from '../../utils'

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
    page.shouldShowAppointmentsWithMissingOutcomes(pagedAppointments.content)

    // When I click on 'Update' for an appointment
    const [selected] = [...pagedAppointments.content].sort(Utils.sortByDate)
    const appointment = appointmentFactory.build({ projectCode: project.projectCode, id: selected.id })
    const supervisors = supervisorSummaryFactory.buildList(2)
    cy.task('stubFindAppointment', { appointment })
    cy.task('stubGetSupervisors', {
      teamCode: appointment.supervisingTeamCode,
      providerCode: appointment.providerCode,
      supervisors,
    })
    cy.task('stubSaveForm')

    page.clickUpdateAnAppointment()

    // Then I should see the start of the appointment update journey
    Page.verifyOnPage(CheckProjectDetailsPage, appointment)
  })

  //  Scenario: navigating back from an individual placement
  it('allows navigation back to individual placement search', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)

    // When I click on the back link
    cy.task('stubGetTeams', { teams: { providers: [{ id: 1, name: 'Team 1' }] } })
    page.clickBack()

    // Then I should see the individual placements search page
    Page.verifyOnPage(FindIndividualPlacementPage)
  })
})
