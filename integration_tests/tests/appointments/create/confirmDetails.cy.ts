//  Feature: Confirm details for a new appointment
//    As a case administrator
//    I want to review the entered details before creating a new appointment
//    So that I can confirm everything is correct

// Scenario: shows the entered answers
//    Given I am on the confirm page for a new appointment
//    Then I can see all completed answers

// Scenario: navigating back from confirm - attended
//    Given I am on the confirm page for a new appointment with an attended outcome
//    When I click back
//    Then I see the log compliance page

// Scenario: navigating back from confirm - not attended
//    Given I am on the confirm page for a new appointment with a non-attended outcome
//    When I click back
//    Then I see the attendance outcome page

// Scenario: navigating back to a given section via a change link
//    Given I am on the confirm page for a new appointment
//    When I click a change link
//    Then I see the corresponding page

// Scenario: navigating back to the date page via the date change link
//    Given I am on the confirm page for a new appointment
//    Then I see the date displayed correctly
//    When I click the date change link
//    Then I see the date page with the entered date

// Scenario: submitting a new appointment
//    Given I am on the confirm page for a new appointment
//    When I click confirm
//    Then the appointment is created
//    And I see the session page with a success message

// Scenario: submitting a new appointment that fails validation
//    Given I am on the confirm page for a new appointment
//    And the API returns a 400 error
//    When I click confirm
//    Then I see the error message

import attendanceDataFactory from '../../../../server/testutils/factories/attendanceDataFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import ChooseProjectPage from '../../../pages/appointments/chooseProjectPage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'
import DatePage from '../../../pages/appointments/datePage'
import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'
import ViewSessionPage from '../../../pages/viewSessionPage'

context('Create appointment - Confirm details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
  })

  describe('shows the entered answers', function describe() {
    // Scenario: shows the entered answers - attended
    it('attended => shows all completed answers for the current form', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        startTime: '09:00',
        endTime: '16:00',
        attendanceData: attendanceDataFactory.build({
          workQuality: 'GOOD',
          behaviour: 'NOT_APPLICABLE',
        }),
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        notes: 'Test',
        isSensitive: undefined,
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // Then I can see all completed answers
      page.shouldShowCompletedDetails()
      page.shouldShowAttendanceDetails(true)
      page.shouldShowHoursCreditedText('7 hours')
    })

    // Scenario: shows the entered answers - not attended
    it('not attended => shows the completed answers without attendance', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        contactOutcome: contactOutcomeFactory.build({ attended: false }),
        isSensitive: undefined,
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // Then I can see all completed answers
      page.shouldShowCompletedDetails()
      page.shouldNotShowAttendanceDetails()
      page.shouldShowHoursCreditedText('0')
    })
  })

  describe('navigating back', function describe() {
    // Scenario: navigating back from confirm - attended
    it('attended => returns to the log compliance page', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        attendanceData: attendanceDataFactory.build({
          workQuality: 'GOOD',
          behaviour: 'NOT_APPLICABLE',
        }),
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment with an attended outcome
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click back
      page.clickBack()

      // Then I see the log compliance page
      const compliancePage = Page.verifyOnPage(LogCompliancePage, { offender: this.offender })
      compliancePage.shouldShowEnteredAnswers(form.attendanceData)
    })

    // Scenario: navigating back from confirm - not attended
    it('did not attend => returns to the attendance outcome page', function test() {
      const attendedOutcome = contactOutcomeFactory.build({ attended: true })
      const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [attendedOutcome] })
      cy.task('stubGetContactOutcomes', { contactOutcomes })

      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        contactOutcome: contactOutcomeFactory.build({ attended: false }),
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment with a non-attended outcome
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click back
      page.clickBack()

      // Then I see the attendance outcome page
      Page.verifyOnPage(AttendanceOutcomePage, { offender: this.offender })
    })
  })

  // Scenario: navigating back to a given section via a change link
  describe('navigating back to a page from the summary page', function describe() {
    it('navigates to choose supervisor when editing supervising officer', function test() {
      const team = providerTeamSummaryFactory.build()
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        supervisingTeam: { code: team.code, name: team.name },
      })
      cy.task('stubGetAppointmentForm', form)

      cy.task('stubFindProject', { project: this.project })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: this.project.providerCode })
      cy.task('stubGetSupervisors', {
        teamCode: team.code,
        providerCode: this.project.providerCode,
        supervisors: [form.supervisor],
      })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Supervising officer')

      // Then I see the corresponding page
      const supervisorPage = Page.verifyOnPage(ChooseSupervisorPage, { offender: this.offender })
      supervisorPage.teamInput.shouldHaveValue(team.code)
      supervisorPage.supervisorInput.shouldHaveValue(form.supervisor.code)
    })

    it('navigates to choose project when editing project team', function test() {
      const form = createAppointmentFormFactory.build({ crn: this.offender.crn })
      cy.task('stubGetAppointmentForm', form)

      const team = providerTeamSummaryFactory.build({ code: form.projectTeam.code })
      cy.task('stubFindProject', { project: this.project })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: this.project.providerCode })

      const projects = projectFactory.buildList(1, { projectCode: form.project.code })
      cy.task('stubGetProjects', {
        projects,
        teamCode: form.projectTeam.code,
        providerCode: this.project.providerCode,
      })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Project team')

      // Then I see the corresponding page
      const projectPage = Page.verifyOnPage(ChooseProjectPage, { offender: this.offender })
      projectPage.form.teamInput.shouldHaveValue(form.projectTeam.code)
    })

    it('navigates to choose project when editing project', function test() {
      const form = createAppointmentFormFactory.build({ crn: this.offender.crn })
      cy.task('stubGetAppointmentForm', form)

      const team = providerTeamSummaryFactory.build({ code: form.projectTeam.code })
      cy.task('stubFindProject', { project: this.project })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: this.project.providerCode })

      const projects = projectFactory.buildList(1, { projectCode: form.project.code })
      cy.task('stubGetProjects', {
        projects: { content: projects },
        teamCode: form.projectTeam.code,
        providerCode: this.project.providerCode,
      })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Project', { exact: true })

      // Then I see the corresponding page
      const projectPage = Page.verifyOnPage(ChooseProjectPage, { offender: this.offender })
      projectPage.form.projectInput.shouldHaveValue(form.project.code)
    })

    it('navigates to the attendance outcome page when editing outcome', function test() {
      const contactOutcomes = contactOutcomesFactory.build()
      const [selected] = contactOutcomes.contactOutcomes

      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        contactOutcome: contactOutcomeFactory.build({ code: selected.code }),
      })
      cy.task('stubGetAppointmentForm', form)
      cy.task('stubGetContactOutcomes', { contactOutcomes })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Outcome')

      // Then I see the corresponding page
      const attendanceOutcomePage = Page.verifyOnPage(AttendanceOutcomePage, { offender: this.offender })
      attendanceOutcomePage.contactOutcomeOptions.shouldHaveSelectedValue(selected.code)
    })

    it('navigates to the attendance outcome page when editing notes', function test() {
      const notes = 'Test note'
      const contactOutcome = contactOutcomeFactory.build({ attended: true })

      const form = createAppointmentFormFactory.build({ crn: this.offender.crn, contactOutcome, notes })
      cy.task('stubGetAppointmentForm', form)

      const contactOutcomes = contactOutcomesFactory.build()
      cy.task('stubGetContactOutcomes', { contactOutcomes })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Notes')

      // Then I see the corresponding page
      const attendanceOutcomePage = Page.verifyOnPage(AttendanceOutcomePage, { offender: this.offender })
      attendanceOutcomePage.notesQuestions.shouldShowNotes(notes)
    })

    it('navigates to the log hours page when editing start and end time', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Start and end time')

      // Then I see the corresponding page
      const logHoursPage = Page.verifyOnPage(LogHoursPage, { offender: this.offender })
      logHoursPage.shouldShowEnteredTimes({ startTime: form.startTime, endTime: form.endTime })
    })

    it('navigates to the log compliance page when editing compliance', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        attendanceData: attendanceDataFactory.build(),
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click a change link
      page.clickChange('Compliance')

      // Then I see the corresponding page
      const logCompliancePage = Page.verifyOnPage(LogCompliancePage, { offender: this.offender })
      logCompliancePage.shouldShowEnteredAnswers(form.attendanceData)
    })

    // Scenario: navigating back to the date page via the date change link
    it('navigates to the date page when editing date', function test() {
      const form = createAppointmentFormFactory.build({ crn: this.offender.crn, date: '2025-09-18' })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // Then I see the date displayed correctly
      page.shouldShowDate('18 September 2025')

      // When I click the date change link
      page.clickChange('Date')

      // Then I see the date page with the entered date
      const datePage = Page.verifyOnPage(DatePage, { offender: this.offender })
      datePage.shouldHaveValue('18/09/2025')
    })
  })

  describe('submitting the appointment', function describe() {
    // Scenario: submitting a new appointment
    it('creates the appointment and shows the session page with a success message', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        project: { code: this.project.projectCode, name: this.project.projectName },
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })
      cy.task('stubGetAppointmentForm', form)
      cy.task('stubFindProject', { project: this.project })
      cy.task('stubCreateAppointment')

      const session = sessionFactory.build({
        date: form.date,
        projectCode: this.project.projectCode,
        projectName: this.project.projectName,
      })
      cy.task('stubFindSession', { session })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click confirm
      page.clickSubmit('Confirm')

      // Then the appointment is created
      // And I see the session page with a success message
      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, session)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')
    })

    // Scenario: submitting a new appointment that fails validation
    it('shows an error message when submission fails with a 400 error', function test() {
      const form = createAppointmentFormFactory.build({
        crn: this.offender.crn,
        project: { code: this.project.projectCode, name: this.project.projectName },
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })
      cy.task('stubGetAppointmentForm', form)
      cy.task('stubFindProject', { project: this.project })

      // And the API returns a 400 error
      const userMessage = 'Invalid appointment data'
      cy.task('stubCreateAppointmentWithError', { userMessage })

      // Given I am on the confirm page for a new appointment
      const page = ConfirmDetailsPage.visitForCreateAppointment(this.project.projectCode, this.offender, form)

      // When I click confirm
      page.clickSubmit('Confirm')

      // Then I see the error message
      page.shouldShowErrorSummary(userMessage)
    })
  })
})
