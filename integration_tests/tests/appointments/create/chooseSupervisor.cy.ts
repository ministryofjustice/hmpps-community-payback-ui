//  Feature: Add supervisor details for a new appointment
//    As a case administrator
//    I want to add supervisor details when creating a new appointment
//    So that I can start recording the appointment outcome

// Scenario: Validating the 'choose supervisor' page
//    Given I am on the 'choose supervisor' page for a new appointment
//    And I do not select a supervisor
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the 'choose supervisor' page for a new appointment
//    And I complete the form
//    Then I see the choose project page

// Scenario: can navigate back to the previous page
//    Given I am on the 'choose supervisor' page for a new appointment
//    When I click back
//    Then I see the date page

import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import ChooseProjectPage from '../../../pages/appointments/chooseProjectPage'
import DatePage from '../../../pages/appointments/datePage'
import Page from '../../../pages/page'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import supervisorSummaryFactory from '../../../../server/testutils/factories/supervisorSummaryFactory'

context('Create appointment - Choose supervisor', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({
      crn: offender.crn,
      projectTeam: { code: project.teamCode, name: project.teamName },
      project: { code: project.projectCode, name: project.projectName },
    })
    cy.wrap(form).as('form')

    const teams = providerTeamSummaryFactory.buildList(2)
    cy.wrap(teams).as('teams')

    cy.task('stubFindProject', { project })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: project.providerCode })
  })

  // Scenario: Validating the 'choose supervisor' page
  it('shows validation messages', function test() {
    // Given I am on the 'choose supervisor' page for a new appointment
    const page = ChooseSupervisorPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I do not select a supervisor
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('team', 'Select a supervising team')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    const supervisors = supervisorSummaryFactory.buildList(2)
    cy.task('stubGetSupervisors', {
      teamCode: this.teams[0].code,
      providerCode: this.project.providerCode,
      supervisors,
    })

    // Given I am on the 'choose supervisor' page for a new appointment
    const page = ChooseSupervisorPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I complete the form
    page.selectTeam(this.teams[0].code)
    page.supervisorInput.select(supervisors[0].code)

    const projects = projectFactory.buildList(1, { projectCode: this.project.projectCode })
    cy.task('stubGetProjects', { projects, teamCode: this.project.teamCode, providerCode: this.project.providerCode })

    page.clickSubmit()

    // Then I see the choose project page
    Page.verifyOnPage(ChooseProjectPage, { offender: this.offender })
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on the 'choose supervisor' page for a new appointment
    const page = ChooseSupervisorPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // When I click back
    page.clickBack()

    // Then I see the date page
    Page.verifyOnPage(DatePage, { offender: this.offender })
  })
})
