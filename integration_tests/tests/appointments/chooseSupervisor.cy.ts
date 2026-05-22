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

    const provider = providerSummaryFactory.build({ code: firstAppointment.providerCode })
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
    cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build())
  })

  describe('Supervisor input', function describe() {
    // Scenario: Supervisor for an appointment has no previously saved value
    it('should not have a selected supervisor if no supervisor on attendance data', function test() {
      const appointment = appointmentFactory.build({ attendanceData: undefined, projectCode: this.project.projectCode })
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
      const appointment = appointmentFactory.build({ projectCode: this.project.projectCode })
      const supervisors = [
        supervisorSummaryFactory.build(),
        supervisorSummaryFactory.build({ code: appointment.supervisorOfficerCode }),
      ]

      const teams = providerTeamSummaryFactory.buildList(2)
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
        }),
      )

      // Given I am on an appointment 'check your details' page
      const page = ChooseSupervisorPage.visit(appointment, appointment.supervisingTeamCode)

      // Then I see a supervisor input with a saved value
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
  })
})
