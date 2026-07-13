//  Feature: Add supervisor details
//    As a case administrator
//    I want to update the supervisor details for an offender
//    So that I can track progress for an unpaid work order

// Scenario: Supervisor for an appointment has no previously saved value
//    Given I am on the 'choose supervisor' page
//    Then I see a blank supervising team input

// Scenario: Supervisor for an appointment has a previously saved value
//    Given I am on an 'choose supervisor' page
//    Then I see a supervisor input with a saved value

// Scenario: Validating the 'choose supervisor' page
//    Given I am on an 'choose supervisor' page
//    And I do not select a supervisor
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on an 'choose supervisor' page
//    And I complete the form
//    Then I see the choose project page

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import locationFactory from '../../../server/testutils/factories/locationFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import providerTeamSummaryFactory from '../../../server/testutils/factories/providerTeamSummaryFactory'
import Page from '../../pages/page'
import ChooseProjectPage from '../../pages/appointments/chooseProjectPage'

context('Choose supervisor', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')
    const time = '09:00:30'
    const firstAppointment = appointmentFactory.build({
      id: 1001,
      projectCode: project.projectCode,
      providerCode: project.providerCode,
      pickUpData: { time, location: locationFactory.build() },
    })
    cy.wrap(firstAppointment).as('appointment')

    const secondAppointment = appointmentFactory.build({ id: 1002, projectCode: project.projectCode })

    const firstAppointmentSummary = appointmentSummaryFactory.build({ id: firstAppointment.id })
    const secondAppointmentSummary = appointmentSummaryFactory.build({ id: secondAppointment.id })

    const session = sessionFactory.build({
      date: firstAppointment.date,
      projectCode: project.projectCode,
      appointmentSummaries: [firstAppointmentSummary, secondAppointmentSummary],
    })
    cy.wrap(session).as('session')

    const supervisors = supervisorSummaryFactory.buildList(2)
    cy.wrap(supervisors).as('supervisors')

    const provider = providerSummaryFactory.build({ code: project.providerCode })
    cy.wrap(provider).as('provider')

    cy.task('stubGetProviders', { providers: { providers: [provider] } })
  })

  beforeEach(function test() {
    cy.task('stubFindProject', { project: this.project })
    cy.task('stubFindSession', { session: this.session })
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetSupervisors', {
      teamCode: this.appointment.supervisingTeamCode,
      providerCode: this.appointment.providerCode,
      supervisors: this.supervisors,
    })
    cy.task('stubSaveAppointmentForm')
    cy.task(
      'stubGetAppointmentForm',
      appointmentOutcomeFormFactory.build({
        projectTeam: { code: this.project.teamCode },
        project: { code: this.project.projectCode },
      }),
    )
  })

  describe('Supervisor input', function describe() {
    // Scenario: Supervisor for an appointment has no previously saved value
    it('should not have a selected supervisor if no supervisor on attendance data', function test() {
      const appointment = appointmentFactory.build({
        attendanceData: undefined,
        projectCode: this.project.projectCode,
        providerCode: this.project.providerCode,
      })
      const supervisors = supervisorSummaryFactory.buildList(2)

      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: appointment.providerCode })

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      // Given I am on an appointment 'check appointment details' page
      const page = ChooseSupervisorPage.visit(appointment)

      // Then I see a blank supervising team input
      page.teamInput.shouldNotHaveAValue()
    })

    // Scenario: Supervisor for an appointment has a previously saved value
    it('should show any existing value for supervisor in the form', function test() {
      const appointment = appointmentFactory.build({
        projectCode: this.project.projectCode,
        providerCode: this.project.providerCode,
      })
      const supervisors = [
        supervisorSummaryFactory.build(),
        supervisorSummaryFactory.build({ code: appointment.supervisorOfficerCode }),
      ]

      const teams = [providerTeamSummaryFactory.build({ code: appointment.supervisingTeamCode })]
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: appointment.providerCode })

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      cy.task(
        'stubGetAppointmentForm',
        appointmentOutcomeFormFactory.build({
          supervisor: supervisors[1],
          supervisingTeam: providerTeamSummaryFactory.build({ code: appointment.supervisingTeamCode }),
        }),
      )

      // Given I am on an appointment 'check your details' page
      const page = ChooseSupervisorPage.visit(appointment)

      // Then I see a supervisor input with a saved value
      page.teamInput.shouldHaveValue(appointment.supervisingTeamCode)
      page.supervisorInput.shouldHaveValue(appointment.supervisorOfficerCode)
    })
  })

  describe('Continue', () => {
    //  Scenario: Validating the check appointment details page
    it('validates form data', function test() {
      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.appointment.providerCode })

      // Given I am on an appointment 'check appointment details' page
      const page = ChooseSupervisorPage.visit(this.appointment)

      // And I do not select a supervisor
      // When I submit the form
      cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build())

      page.clickSubmit()

      // Then I see the same page with errors
      page.shouldShowErrorSummary('team', 'Select a supervising team')
      page.teamInput.shouldHaveValue('')
    })

    // Scenario: can complete the form and navigate to the next page
    it('submits the form and navigates to the next page', function test() {
      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.appointment.providerCode })

      cy.task('stubGetSupervisors', {
        teamCode: teams[0].code,
        providerCode: this.appointment.providerCode,
        supervisors: this.supervisors,
      })

      //  Given I am on an 'choose supervisor' page
      const page = ChooseSupervisorPage.visit(this.appointment)

      page.selectTeam(teams[0].code)
      page.supervisorInput.select(this.supervisors[0].code)

      const projects = projectFactory.buildList(1, { projectCode: this.project.projectCode })
      cy.task('stubGetProjects', { projects, teamCode: this.project.teamCode, providerCode: this.project.providerCode })

      page.clickSubmit()

      Page.verifyOnPage(ChooseProjectPage, this.appointment.offender)
    })
  })
})
