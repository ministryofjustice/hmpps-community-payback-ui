//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Accessing the update appointment form
//    Given I am on a session details page
//    When I click update next for a particular session
//    Then I see the check project details page

//  Scenario: Viewing a session with Limited Access Offenders
//    Given I am viewing a session details page with limited access offenders
//    Then I see limited offender details and no option to update

// Scenario: Returning to a session page if group placement
//    Given I am on an appointment 'check project details' page
//    When I click back
//    Then I see the details of the session for that appointment

// Scenario: Returning to a session page if individual placement
//    Given I am on an appointment 'check project details' page
//    When I click back
//    Then I see the details of the project for that appointment

// Scenario: Supervisor for an appointment has no previously saved value
//    Given I am on an appointment 'check project details' page
//    Then I see a blank supervisor input

// Scenario: Supervisor for an appointment has a previously saved value
//    Given I am on an appointment 'check your details' page
//    Then I see a supervisor input with a saved value

//  Scenario: Validating the check project details page
//    Given I am on an appointment 'check project details' page
//    And I do not select a supervisor
//    When I submit the form
//    Then I see the same page with errors

import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import Page from '../../pages/page'
import ViewSessionPage from '../../pages/viewSessionPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import { contactOutcomesFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import offenderLimitedFactory from '../../../server/testutils/factories/offenderLimitedFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import ProjectPage from '../../pages/projects/projectPage'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import { baseProjectAppointmentRequest } from '../../mockApis/projects'

context('Session details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const firstAppointment = appointmentFactory.build({ id: 1001, projectCode: project.projectCode })
    cy.wrap(firstAppointment).as('appointment')

    const secondAppointment = appointmentFactory.build({ id: 1002, projectCode: project.projectCode })

    const firstAppointmentSummary = appointmentSummaryFactory.build({ id: firstAppointment.id })
    const secondAppointmentSummary = appointmentSummaryFactory.build({ id: secondAppointment.id })

    const session = sessionFactory.build({
      date: firstAppointment.date,
      startTime: firstAppointment.startTime,
      endTime: firstAppointment.endTime,
      projectCode: project.projectCode,
      appointmentSummaries: [firstAppointmentSummary, secondAppointmentSummary],
    })
    cy.wrap(session).as('session')

    const supervisors = supervisorSummaryFactory.buildList(2)
    cy.wrap(supervisors).as('supervisors')
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
    cy.task('stubSaveForm')
  })

  //  Scenario: Accessing the update appointment form
  it('shows an option to update an appointment on a session', function test() {
    // Given I am on the view session page
    const page = ViewSessionPage.visit(this.session)
    page.shouldShowAppointmentsList()

    // When I click update for a particular session
    page.clickUpdateAnAppointment()

    // Then I see the check project details page
    const checkProjectDetailsPage = Page.verifyOnPage(CheckProjectDetailsPage, this.appointment, this.project)
    checkProjectDetailsPage.shouldContainProjectDetails()
  })

  //  Scenario: Viewing a session with Limited Access Offenders
  it('does not enable appointment update for a limited access offender', function test() {
    const session = sessionFactory.build({
      appointmentSummaries: appointmentSummaryFactory.buildList(2, {
        offender: offenderLimitedFactory.build(),
      }),
    })

    // Given I am on the view session page
    cy.task('stubFindSession', { session })
    const page = ViewSessionPage.visit(session)

    // Then I see limited information about offenders and cannot update
    page.shouldShowOffendersWithNoNames()
    page.shouldNotHaveUpdateLinksForOffenders()
  })

  // Scenario: Returning to a session page
  it('enables navigation back to session page', function test() {
    // Given I am on an appointment 'check your details' page
    const page = CheckProjectDetailsPage.visit(this.appointment, this.project)

    // When I click back
    cy.task('stubFindSession', { session: this.session })
    page.clickBack()

    // Then I see the details of the session for that appointment
    Page.verifyOnPage(ViewSessionPage, this.session)
  })

  // Scenario: Returning to a project page if individual placement
  it('enables navigation back to project page', function test() {
    // Given I am on an appointment 'check your details' page
    const project = projectFactory.build({
      projectType: { group: 'INDIVIDUAL' },
    })
    const appointment = appointmentFactory.build({
      // match the supervisor request
      supervisingTeamCode: this.appointment.supervisingTeamCode,
      providerCode: this.appointment.providerCode,
      projectCode: project.projectCode,
    })

    cy.task('stubFindAppointment', { appointment })
    cy.task('stubFindProject', { project })

    const page = CheckProjectDetailsPage.visit(appointment, project)

    // When I click back
    const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

    const request = {
      ...baseProjectAppointmentRequest(),
      projectCodes: [project.projectCode],
    }
    cy.task('stubGetAppointments', { request, pagedAppointments })
    page.clickBack()

    // Then I see the details of the session for that appointment
    Page.verifyOnPage(ProjectPage, project)
  })
  //    Given I am on an appointment 'check project details' page
  //    When I click back
  //    Then I see the details of the project for that appointment

  describe('Supervisor input', function describe() {
    // Scenario: Supervisor for an appointment has no previously saved value
    it('should not have a selected supervisor if no supervisor on attendance data', function test() {
      const appointment = appointmentFactory.build({ attendanceData: undefined, projectCode: this.project.projectCode })
      const supervisors = supervisorSummaryFactory.buildList(2)

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      // Given I am on an appointment 'check project details' page
      const page = CheckProjectDetailsPage.visit(appointment, this.project)

      // Then I see a blank supervisor input
      page.supervisorInput.shouldNotHaveAValue()
    })

    // Scenario: Supervisor for an appointment has a previously saved value
    it('should show any existing value for supervisor in the form', function test() {
      const appointment = appointmentFactory.build({ projectCode: this.project.projectCode })
      const supervisors = [
        supervisorSummaryFactory.build(),
        supervisorSummaryFactory.build({ code: appointment.supervisorOfficerCode }),
      ]

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      // Given I am on an appointment 'check your details' page
      const page = CheckProjectDetailsPage.visit(appointment, this.project)

      // Then I see a supervisor input with a saved value
      page.supervisorInput.shouldHaveValue(appointment.supervisorOfficerCode)
    })
  })

  describe('Continue', () => {
    //  Scenario: Validating the check project details page
    it('validates form data', function test() {
      // Given I am on an appointment 'check project details' page
      const page = CheckProjectDetailsPage.visit(this.appointment, this.project)

      // And I do not select a supervisor
      // When I submit the form
      cy.task('stubGetForm', appointmentOutcomeFormFactory.build())

      page.clickSubmit()

      // Then I see the same page with errors
      page.shouldShowErrorSummary('supervisor', 'Select a supervisor')
      page.supervisorInput.shouldHaveValue('')
    })

    //  Scenario: Completing the check project details page
    it('continues to the next page', function test() {
      const contactOutcomes = contactOutcomesFactory.build()

      // Given I am on an appointment 'check project details' page
      const page = CheckProjectDetailsPage.visit(this.appointment, this.project)

      // And I select a supervisor
      page.supervisorInput.select(this.supervisors[0].fullName)

      cy.task('stubGetContactOutcomes', { contactOutcomes })
      cy.task('stubGetForm', {})
      // When I submit the form
      page.clickSubmit()

      // Then I see the attendance outcome page
      Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
    })
  })
})
