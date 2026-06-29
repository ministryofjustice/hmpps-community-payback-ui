//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Accessing the update appointment form
//    Given I am on a session details page
//    When I click update next for a particular session
//    Then I see the check appointment details page

//  Scenario: Accessing the view appointment form
//    Given I am on the view session page
//    When I click view for a particular session
//    Then I see the check appointment details page

//  Scenario: Viewing a session with Limited Access Offenders
//    Given I am viewing a session details page with limited access offenders
//    Then I see limited offender details and no option to update

//  Scenario: Navigating back => group session
//    Scenario: Returning to a session page if group placement
//      Given I am on an appointment 'check appointment details' page
//      When I click back
//      Then I see the details of the session for that appointment
//    Scenario: Returning to session search from appointment details
//      Given I am on an appointment 'check appointment details' page
//      When I click back
//      And I click back again
//      Then I see the original search results

//  Scenario: Navigating back => individual placement
//    Scenario: Returning to a session page if individual placement
//      Given I am on an appointment 'check appointment details' page
//      When I click back
//      Then I see the details of the project for that appointment
//    Scenario: Returning to project search from appointment details
//      Given I am on an appointment 'check appointment details' page
//      When I click back
//      And I click back again
//      Then I see the original search results

//  Scenario: Viewing the appointment details page with an existing outcome
//    Given I am on the appointment details page
//    And an outcome has previously been recorded
//    Then I should not see the Continue button
//    And I should see outcome details

//  Scenario: Completing the check appointment details page
//    Given I am on an appointment 'check appointment details' page
//    Then I should not see compliance details
//    When I submit the form
//    Then I see the choose supervisor page

//  Scenario: Displaying a call to action for missing outcome
//    Given I am on an appointment 'check appointment details' page for an appointment in the past
//    When I click the call to action
//    Then I see the choose supervisor page
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import Page from '../../pages/page'
import ViewSessionPage from '../../pages/viewSessionPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import offenderLimitedFactory from '../../../server/testutils/factories/offenderLimitedFactory'
import ProjectPage from '../../pages/projects/projectPage'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import { baseProjectAppointmentRequest } from '../../mockApis/projects'
import locationFactory from '../../../server/testutils/factories/locationFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../server/testutils/factories/providerTeamSummaryFactory'
import FindASessionPage from '../../pages/findASessionPage'
import FindIndividualPlacementPage from '../../pages/projects/findIndividualPlacementPage'
import pagedModelProjectOutcomeSummaryFactory from '../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import sessionSummaryFactory from '../../../server/testutils/factories/sessionSummaryFactory'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import { pickupLocationFactory } from '../../../server/testutils/factories/pickupDataFactory'
import attendanceDataFactory from '../../../server/testutils/factories/attendanceDataFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

context('Session details', () => {
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
      pickUpData: { time, pickupLocation: pickupLocationFactory.build() },
      contactOutcomeCode: undefined,
      attendanceData: undefined,
    })
    cy.wrap(firstAppointment).as('appointment')

    const secondAppointment = appointmentFactory.build({
      id: 1002,
      projectCode: project.projectCode,
      contactOutcomeCode: undefined,
    })

    const firstAppointmentSummary = appointmentSummaryFactory.build({
      id: firstAppointment.id,
      contactOutcome: undefined,
    })
    const secondAppointmentSummary = appointmentSummaryFactory.build({
      id: secondAppointment.id,
      contactOutcome: undefined,
    })

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
  })

  //  Scenario: Accessing the view appointment form
  it('shows an option to view an appointment on a session', function test() {
    const appointment = appointmentFactory.build({
      projectCode: this.project.projectCode,
      pickUpData: { time: '09:00:30', location: locationFactory.build() },
    })

    const appointmentSummaries = appointmentSummaryFactory.buildList(1, {
      id: appointment.id,
      contactOutcome: undefined,
      projectCode: appointment.projectCode,
    })

    const session = sessionFactory.build({
      appointmentSummaries,
      projectCode: this.project.projectCode,
    })

    const contactOutcomes = [
      ...contactOutcomeFactory.buildList(2),
      contactOutcomeFactory.build({ code: appointment.contactOutcomeCode }),
    ]

    cy.task('stubFindSession', { session })
    // Given I am on the view session page
    const page = ViewSessionPage.visit(session)
    page.shouldShowAppointmentsList()

    // When I click view for a particular session
    const provider = providerSummaryFactory.build({ code: appointment.providerCode })
    cy.task('stubFindAppointment', { appointment })
    cy.task('stubGetProviders', { providers: { providers: [provider] } })
    cy.task('stubGetSupervisors', {
      teamCode: appointment.supervisingTeamCode,
      providerCode: appointment.providerCode,
      supervisors: this.supervisors,
    })
    cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes } })
    page.clickViewAnAppointment()

    // Then I see the check appointment details page
    const checkAppointmentDetailsPage = Page.verifyOnPage(
      CheckAppointmentDetailsPage,
      appointment,
      this.project,
      provider,
    )
    checkAppointmentDetailsPage.shouldContainProjectDetails()
    checkAppointmentDetailsPage.shouldContainNotesDetails()
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
    const project = projectFactory.build({
      projectCode: session.projectCode,
    })
    cy.task('stubFindProject', { project })
    const page = ViewSessionPage.visit(session)

    // Then I see limited information about offenders and cannot update
    page.shouldShowOffendersWithNoNames()
    page.shouldNotHaveUpdateLinksForOffenders()
  })

  describe('navigating back => group session', () => {
    // Scenario: Returning to a session page
    it('enables navigation back to session page', function test() {
      // Given I am on an appointment 'check your details' page
      const page = CheckAppointmentDetailsPage.visit(this.appointment, this.project)

      // When I click back
      cy.task('stubFindSession', { session: this.session })
      page.clickBack()

      // Then I see the details of the session for that appointment
      Page.verifyOnPage(ViewSessionPage, this.session)
    })

    // Scenario: Returning to session search from appointment details
    it('enables navigation back to session page', function test() {
      const provider = providerSummaryFactory.build()
      const team = providerTeamSummaryFactory.build()
      const originalSearch = {
        provider: provider.code,
        team: team.code,
        date: '18/09/2025',
      }
      // Given I am on an appointment 'check your details' page
      const page = CheckAppointmentDetailsPage.visit(this.appointment, this.project, originalSearch)

      // When I click back
      cy.task('stubFindSession', { session: this.session })
      page.clickBack()
      const sessionPage = Page.verifyOnPage(ViewSessionPage, this.session)

      // And I click back again
      // And I search for sessions
      cy.task('stubGetProviders', { providers: { providers: [provider] } })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: provider.code })
      const session = sessionSummaryFactory.build()
      cy.task('stubGetSessions', {
        request: {
          providerCode: provider.code,
          teamCode: team.code,
          startDate: '2025-09-18',
          endDate: '2025-09-18',
          username: 'some-name',
        },
        sessions: {
          content: [session],
        },
      })

      sessionPage.clickBack()

      // Then I see the original search results
      const searchPage = Page.verifyOnPage(FindASessionPage)
      searchPage.shouldShowSearchResults(session)
    })
  })

  describe('navigating back => individual placement', () => {
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
        contactOutcomeCode: undefined,
      })

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubFindProject', { project })

      const page = CheckAppointmentDetailsPage.visit(appointment, project, this.provider)

      // When I click back
      const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

      const request = {
        ...baseProjectAppointmentRequest(),
        projectCodes: [project.projectCode],
      }
      cy.task('stubGetAppointments', { request, pagedAppointments })
      page.clickBack()

      // Then I see the details of the project for that appointment
      Page.verifyOnPage(ProjectPage, project)
    })

    // Scenario: Returning to project search from appointment details
    it('enables navigation back to original project search', function test() {
      // Given I am on an appointment 'check your details' page
      const project = projectFactory.build({
        projectType: { group: 'INDIVIDUAL' },
      })
      const appointment = appointmentFactory.build({
        // match the supervisor request
        supervisingTeamCode: this.appointment.supervisingTeamCode,
        providerCode: this.appointment.providerCode,
        projectCode: project.projectCode,
        contactOutcomeCode: undefined,
      })

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubFindProject', { project })

      const page = CheckAppointmentDetailsPage.visit(appointment, project, {
        provider: this.appointment.providerCode,
        team: this.appointment.supervisingTeamCode,
      })

      // When I click back
      const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

      const request = {
        ...baseProjectAppointmentRequest(),
        projectCodes: [project.projectCode],
      }
      cy.task('stubGetAppointments', { request, pagedAppointments })
      page.clickBack()

      // And I click back again
      cy.task('stubGetTeams', {
        teams: { providers: [providerTeamSummaryFactory.build({ code: this.appointment.supervisingTeamCode })] },
        providerCode: this.appointment.providerCode,
      })
      const projects = pagedModelProjectOutcomeSummaryFactory.build()
      cy.task('stubGetProjects', {
        teamCode: this.appointment.supervisingTeamCode,
        providerCode: this.appointment.providerCode,
        projects,
      })
      const projectPage = Page.verifyOnPage(ProjectPage, project)
      projectPage.clickBack()

      // Then I see the original search results
      const searchPage = Page.verifyOnPage(FindIndividualPlacementPage, projects.content)
      searchPage.shouldShowIndividualPlacements()
    })
  })

  describe('Contact outcome status', () => {
    // Scenario: Viewing the appointment details page with an existing outcome
    it('shows outcome details and does not show the continue button if a contact outcome exists', function test() {
      const contactOutcome = contactOutcomeFactory.build({ name: 'Attended - complied' })

      const appointmentWithContactOutcome = appointmentFactory.build({
        contactOutcomeCode: contactOutcome.code,
        projectCode: this.project.projectCode,
        attendanceData: attendanceDataFactory.build({ penaltyMinutes: 30 }),
        minutesCredited: 60,
      })
      cy.task('stubFindAppointment', { appointment: appointmentWithContactOutcome })

      const contactOutcomes = [...contactOutcomeFactory.buildList(2), contactOutcome]
      cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes } })

      cy.task('stubGetSupervisors', {
        teamCode: appointmentWithContactOutcome.supervisingTeamCode,
        providerCode: appointmentWithContactOutcome.providerCode,
        supervisors: this.supervisors,
      })

      // Given I am on the appointment details page
      const page = CheckAppointmentDetailsPage.visit(appointmentWithContactOutcome, this.project, this.provider)

      // And an outcome has previously been recorded

      // Then I should not see the Continue button
      page.shouldNotShowContinueButton()

      // And I should see outcome details
      page.shouldContainComplianceDetails()
      page.shouldContainTimeDetails({ worked: '1 hour 30 minutes', penalty: '30 minutes', credited: '1 hour' })
      page.shouldContainNotesDetails()
      page.shouldShowSharedInformation()
      page.shouldShowTagWith(contactOutcome.name)
      page.warningMessage.shouldNotBeVisible()
    })

    //  Scenario: Completing the check appointment details page
    it('does not show compliance details and allows user to continue to the next page', function test() {
      const contactOutcomes = contactOutcomesFactory.build()

      const appointmentWithoutContactOutcome = appointmentFactory.build({
        contactOutcomeCode: undefined,
        projectCode: this.project.projectCode,
        providerCode: this.project.providerCode,
        attendanceData: undefined,
        minutesCredited: undefined,
        enforcementData: undefined,
        alertActive: undefined,
        notes: undefined,
        sensitive: undefined,
      })
      cy.task('stubFindAppointment', { appointment: appointmentWithoutContactOutcome })
      cy.task('stubGetSupervisors', {
        teamCode: appointmentWithoutContactOutcome.supervisingTeamCode,
        providerCode: appointmentWithoutContactOutcome.providerCode,
        supervisors: this.supervisors,
      })

      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', {
        teams: { providers: teams },
        providerCode: appointmentWithoutContactOutcome.providerCode,
      })

      // Given I am on an appointment 'check appointment details' page
      const page = CheckAppointmentDetailsPage.visit(appointmentWithoutContactOutcome, this.project, this.provider)
      page.shouldContainProjectDetails()

      // Then I should not see compliance details
      page.complianceDetails.shouldNotBeVisible()
      page.hoursDetails.shouldNotBeVisible()
      page.sharedDetails.shouldNotBeVisible()
      page.notesDetails.shouldNotBeVisible()
      cy.task('stubGetContactOutcomes', { contactOutcomes })
      cy.task('stubGetAppointmentForm', {})
      // When I click update
      page.clickUpdate()

      // Then I see the choose supervisor page
      Page.verifyOnPage(ChooseSupervisorPage, appointmentWithoutContactOutcome)
    })

    //  Scenario: Displaying a call to action for missing outcome
    it('shows a warning message with call to action to update appointment', function test() {
      const contactOutcomes = contactOutcomesFactory.build()

      const appointmentInThePast = appointmentFactory.build({
        contactOutcomeCode: undefined,
        projectCode: this.project.projectCode,
        providerCode: this.project.providerCode,
        date: DateTimeFormats.getTodaysDatePlusDays(-1).formattedDate,
      })
      cy.task('stubFindAppointment', { appointment: appointmentInThePast })
      cy.task('stubGetSupervisors', {
        teamCode: appointmentInThePast.supervisingTeamCode,
        providerCode: appointmentInThePast.providerCode,
        supervisors: this.supervisors,
      })
      cy.task('stubGetContactOutcomes', { contactOutcomes })
      cy.task('stubGetAppointmentForm', {})

      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: appointmentInThePast.providerCode })

      // Given I am on an appointment 'check appointment details' page for an appointment in the past
      const page = CheckAppointmentDetailsPage.visit(appointmentInThePast, this.project, this.provider)
      page.shouldContainProjectDetails()

      // When I click the call to action
      page.warningMessage.clickCallToAction()

      // Then I see the choose supervisor page
      Page.verifyOnPage(ChooseSupervisorPage, appointmentInThePast)
    })
  })
})
