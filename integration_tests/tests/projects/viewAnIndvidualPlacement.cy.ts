//  Feature: View an independent placement project
//    As a case admin
//    So that I can report on people's progress on a single project
//    I want to view details about a project
//    And view any missing outcomes I need to capture
//
//  Scenario: viewing an individual placement
//    Given I am on the project page
//    Then I should see the project details

import ProjectPage from '../../pages/projects/projectPage'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'

context('Project page', () => {
  const baseAppointmentRequest = {
    outcomeCodes: ['NO_OUTCOME'],
    toDate: DateTimeFormats.dateObjToIsoString(new Date()),
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  //  Scenario: viewing an individual placement
  it('shows project details', () => {
    const project = projectFactory.build()
    const pagedAppointments = pagedModelAppointmentSummaryFactory.build()
    const request = { ...baseAppointmentRequest, projectCodes: [project.projectCode] }
    cy.task('stubFindProject', { project })
    cy.task('stubGetAppointments', { request, pagedAppointments })
    //  Given I am on the project page
    const page = ProjectPage.visit(project)

    //  Then I should see the project details
    page.shouldShowProjectDetails()
    page.shouldShowAppointmentsWithMissingOutcomes(pagedAppointments.content)
  })
})
