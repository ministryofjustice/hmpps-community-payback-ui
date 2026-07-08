//  Feature: Add project details
//    As a case administrator
//    I want to update the project details for an offender
//    So that I can track progress for an unpaid work order

// Scenario: Project for an appointment has no previously saved value
//    Given I am on a 'choose project' page
//    Then I see a blank team input with no project input

// Scenario: Project for an appointment has previously saved values
//    Given I am on a 'choose project' page
//    Then I see team and project inputs with saved values

// Scenario: Validating the choose project page
//    Given I am on a 'choose project' page
//    And I do not select a team
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on a 'choose project' page
//    And I complete the form
//    Then I see the attendance outcome page

// Scenario: can navigate back to the previous page
//    Given I am on a 'choose project' page
//    When I click back
//    Then I see the choose supervisor page

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import projectOutcomeSummaryFactory from '../../../server/testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../server/testutils/factories/providerTeamSummaryFactory'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import ChooseProjectPage from '../../pages/appointments/chooseProjectPage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import Page from '../../pages/page'

context('Choose project', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const appointment = appointmentFactory.build({
      id: 1001,
      projectCode: project.projectCode,
      providerCode: project.providerCode,
    })
    cy.wrap(appointment).as('appointment')

    const teams = providerTeamSummaryFactory.buildList(2)
    cy.wrap(teams).as('teams')

    const form = appointmentOutcomeFormFactory.build()
    cy.wrap(form).as('form')

    const team = providerTeamSummaryFactory.build({ code: form.projectTeam.code })
    cy.wrap(team).as('team')
    const selectedProject = projectOutcomeSummaryFactory.build({
      projectCode: form.project.code,
      projectName: form.project.name,
    })
    cy.wrap(selectedProject).as('selectedProject')

    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: project.providerCode })
    cy.task('stubGetProjects', {
      projects: { content: [selectedProject] },
      teamCode: form.projectTeam.code,
      providerCode: project.providerCode,
    })

    cy.task('stubFindProject', { project })
    cy.task('stubFindAppointment', { appointment })
    cy.task('stubGetAppointmentForm', form)
  })

  describe('Project inputs', function describe() {
    // Scenario: Project for an appointment has previously saved values
    it('should show any existing values for team and project in the form', function test() {
      // Given I am on a 'choose project' page
      const page = ChooseProjectPage.visit(this.appointment)

      // Then I see team and project inputs with saved values
      page.form.teamInput.shouldHaveValue(this.team.code)
      page.form.projectInput.shouldHaveValue(this.selectedProject.projectCode)
    })
  })

  describe('Continue', function describe() {
    // Scenario: Validating the choose project page - team input
    it('validates team field', function test() {
      // Given I am on a 'choose project' page
      const page = ChooseProjectPage.visit(this.appointment)

      // And I do not select a team
      // When I submit the form
      page.form.clearTeam()
      page.clickSubmit()

      // Then I see the same page with errors
      page.form.shouldShowTeamError()
      page.form.teamInput.shouldHaveValue('')
    })

    // Scenario: Validating the choose project page
    it('validates project field', function test() {
      // Given I am on a 'choose project' page
      const page = ChooseProjectPage.visit(this.appointment)

      // And I do not select a project
      // When I submit the form
      page.form.clearProject()
      page.clickSubmit()

      // Then I see the same page with errors
      page.form.shouldShowProjectError()
      page.form.projectInput.shouldHaveValue('')
    })

    // Scenario: can complete the form and navigate to the next page
    it('submits the form and navigates to the next page', function test() {
      const contactOutcomes = contactOutcomesFactory.build({
        contactOutcomes: [contactOutcomeFactory.build({ attended: true })],
      })
      cy.task('stubGetContactOutcomes', { contactOutcomes })
      cy.task('stubSaveAppointmentForm')

      // Given I am on a 'choose project' page
      const page = ChooseProjectPage.visit(this.appointment)

      // And I complete the form
      page.clickSubmit()

      // Then I see the attendance outcome page
      Page.verifyOnPage(AttendanceOutcomePage, this.appointment.offender)
    })
  })

  // Scenario: can navigate back to the previous page
  it('navigates back to the previous page', function test() {
    // Given I am on a 'choose project' page
    const page = ChooseProjectPage.visit(this.appointment)

    // When I click back
    page.clickBack()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, this.appointment.offender)
  })
})
