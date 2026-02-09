//  Feature: View an independent placement project
//    As a case admin
//    So that I can report on people's progress on a single project
//    I want to view details about a project
//    And view any missing outcomes I need to capture
//
//  Scenario: viewing an individual placement
//    Given I am on the project page
//    Then I should see the project details
//
//  Scenario: navigating back from an individual placement
//    Given I am on the project page
//    When I click on the back link
//    Then I should see the individual placements search page

import ProjectPage from '../../pages/projects/projectPage'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import Page from '../../pages/page'
import FindIndividualPlacementPage from '../../pages/projects/findIndividualPlacementPage'

context('Project page', () => {
  const baseAppointmentRequest = {
    outcomeCodes: ['NO_OUTCOME'],
    toDate: DateTimeFormats.dateObjToIsoString(new Date()),
  }

  const project = projectFactory.build()
  const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindProject', { project })
    const request = { ...baseAppointmentRequest, projectCodes: [project.projectCode] }
    cy.task('stubGetAppointments', { request, pagedAppointments })
  })

  //  Scenario: viewing an individual placement
  it('shows project details', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)

    //  Then I should see the project details
    page.shouldShowProjectDetails()
    page.shouldShowAppointmentsWithMissingOutcomes(pagedAppointments.content)
  })

  //  Scenario: navigating back from an individual placement
  it('allows navigation back to individual placement search', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit(project)

    // When I click on the back link
    page.clickBack()

    // Then I should see the individual placements search page
    Page.verifyOnPage(FindIndividualPlacementPage)
  })
})
