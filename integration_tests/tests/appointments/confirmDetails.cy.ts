//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Confirming an appointment update
//    Given I am on the confirm page of an in progress update
//    Then I can see all completed answers

//  Scenario: Confirming an appointment update - not attended
//    Given I am on the confirm page of an in progress update
//    Then I can see my completed answers without attendance

//  Scenario: alerting the probation practitioner
//    Scenario: Cannot alert if selected contact outcome already sends an alert
//      Given I am on the confirm page
//      And I have selected a contact outcome which will alert the enforcement diary
//      Then I do not see a question asking if I want to alert the probation practitioner
//    Scenario: Can alert if selected contact outcome does not send an alert
//      Given I am on the confirm page
//      And I have selected a contact outcome which will not alert the enforcement diary
//      Then I can answer yes or no to question asking if I want to alert the probation practitioner

// Scenario: navigating back from confirm - attended
//    Given I am on the confirm page of an in progress update
//    And I click back
//    Then I can see the log compliance questions

// Scenario: navigating back from confirm - not attended
//    Given I am on the confirm page of an in progress update
//    And I click back
//    Then I can see the log hours question
//
// Scenario: navigating back to a given section
//    Given I am on the confirm page of an in progress update
//    And I click change
//    Then I can see the corresponding page
//
// Scenario: submitting appointment update for a group placement
//    Given I am on the confirm page of an in progress update
//    And I click confirm
//    Then I can see the session page with success message
//
// Scenario: submitting appointment update for individual placement
//    Given I am on the confirm page of an in progress update
//    And I click confirm
//    Then I can see the project page with success message
//
// Scenario: submitting appointment update that has been changed in Delius
//    Given the appointment version and the version saved on the form do not match
//    And I am on the confirm page of an in progress update
//    And I click confirm
//    Then I can see the session page with error message

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../../server/testutils/factories/attendanceDataFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import { baseProjectAppointmentRequest } from '../../mockApis/projects'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import Page from '../../pages/page'
import ProjectPage from '../../pages/projects/projectPage'
import ViewSessionPage from '../../pages/viewSessionPage'

context('Confirm appointment details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build({ id: 1001 })
    cy.wrap(appointment).as('appointment')
  })

  // Scenario: Confirming an appointment update - attended
  it('attended => shows all completed answers for the current form', function test() {
    const form = appointmentOutcomeFormFactory.build({
      startTime: '09:00',
      endTime: '16:00',
      attendanceData: attendanceDataFactory.build({
        hiVisWorn: false,
        penaltyMinutes: 60,
        workedIntensively: false,
        workQuality: 'GOOD',
        behaviour: 'NOT_APPLICABLE',
      }),
      contactOutcome: contactOutcomeFactory.build({
        attended: true,
      }),
      notes: 'Test',
    })

    // Given I am on the confirm page of an in progress update
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails()
    page.shouldShowAttendanceDetails()
  })

  // Scenario: Confirming an appointment update - not attended
  it('not attended => shows my completed answers for the current form', function test() {
    const form = appointmentOutcomeFormFactory.build({
      startTime: '09:00',
      endTime: '16:00',
      attendanceData: attendanceDataFactory.build({
        penaltyMinutes: 60,
        workedIntensively: false,
      }),
      contactOutcome: contactOutcomeFactory.build({
        attended: false,
      }),
      sensitive: null,
    })

    // Given I am on the confirm page of an in progress update
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my completed answers without attendance
    page.shouldShowCompletedDetails()
    page.shouldNotShowAttendanceDetails()
  })

  // Scenario: alerting the probation practitioner
  describe('alert practitioner question', function describe() {
    //  Scenario: Cannot alert if selected contact outcome already sends an alert
    it('selected contact outcome sends alert => does not display alert practitioner question', function test() {
      //  Given I am on the confirm page
      //  And I have selected a contact outcome which will alert the enforcement diary
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          willAlertEnforcementDiary: true,
        }),
      })

      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.shouldShowCompletedDetails()

      //  Then I do not see a question asking if I want to alert the probation practitioner
      page.alertPractitionerQuestion.shouldNotBeVisible()
      page.shouldShowAlertPractitionerMessage()
    })

    //  Scenario: Can alert if selected contact outcome does not send an alert
    it('selected contact outcome does not send alert => displays alert practitioner question', function test() {
      //  Given I am on the confirm page
      //  And I have selected a contact outcome which will not alert the enforcement diary
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          willAlertEnforcementDiary: false,
        }),
      })

      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.shouldShowCompletedDetails()

      //  Then I can answer yes or no to question asking if I want to alert the probation practitioner
      page.alertPractitionerQuestion.checkOptionWithValue('yes')
      page.alertPractitionerQuestion.checkOptionWithValue('no')
      page.shouldNotShowAlertPractitionerMessage()
    })
  })

  describe('navigating back', function action() {
    // Scenario: navigating back from confirm
    it('attended => returns to compliance page', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          attended: true,
        }),
      })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      // And I click back
      page.clickBack()

      // Then I can see the log compliance questions with my entered answers
      const compliancePage = Page.verifyOnPage(LogCompliancePage, this.appointment)
      compliancePage.shouldShowEnteredAnswers(form.attendanceData)
    })

    // Scenario: navigating back from confirm - did not attended
    it('did not attend => returns to log hours page', function test() {
      // Given I am on the confirm page of an in progress update not attended
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          attended: false,
        }),
      })

      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      // And I click back
      page.clickBack()

      // Then I can see the log hours questions
      Page.verifyOnPage(LogHoursPage, this.appointment)
    })
  })

  // Scenario: navigating back to a given section
  describe('navigating back to a page from the summary page', function describe() {
    const contactOutcomes = contactOutcomesFactory.build()

    it('navigates back to the appointment details page', function test() {
      const project = projectFactory.build({ projectCode: this.appointment.projectCode })
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const provider = providerSummaryFactory.build({ code: this.appointment.providerCode })
      cy.task('stubGetProviders', { providers: { providers: [provider] } })

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      const supervisors = [
        ...supervisorSummaryFactory.buildList(2),
        supervisorSummaryFactory.build({ code: form.supervisor.code }),
      ]
      cy.task('stubGetSupervisors', {
        teamCode: this.appointment.supervisingTeamCode,
        providerCode: this.appointment.providerCode,
        supervisors,
      })
      cy.task('stubFindProject', { project })

      // And I click change
      page.clickChange('Supervising officer')

      // Then I can see the appointment details page
      const appointmentDetailsPage = Page.verifyOnPage(CheckAppointmentDetailsPage, this.appointment, project)
      appointmentDetailsPage.shouldContainProjectDetails()
      appointmentDetailsPage.supervisorInput.shouldHaveValue(form.supervisor.code)
    })

    it('navigates back to the log attendance page', function test() {
      const [selected] = contactOutcomes.contactOutcomes
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ code: selected.code }),
      })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      cy.task('stubGetContactOutcomes', { contactOutcomes })

      // And I click change
      page.clickChange('Attendance')

      // Then I can see the log attendance page
      const attendanceOutcomePage = Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
      attendanceOutcomePage.contactOutcomeOptions.shouldHaveSelectedValue(selected.code)
    })

    it('navigates back to the log attendance page via notes section', function test() {
      const notes = 'Test note'
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome, notes })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      cy.task('stubGetContactOutcomes', { contactOutcomes })

      // And I click change
      page.clickChange('Notes')

      // Then I can see the log compliance page
      const attendanceOutcomePage = Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
      attendanceOutcomePage.shouldShowNotes(notes)
    })

    it('navigates back to the log attendance page via sensitive section', function test() {
      const notes = 'Test note'
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome, notes, sensitive: true })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      cy.task('stubGetContactOutcomes', { contactOutcomes })

      // And I click change
      page.clickChange('Sensitive')

      // Then I can see the log compliance page
      const attendanceOutcomePage = Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
      attendanceOutcomePage.shouldShowNotes(notes)
      attendanceOutcomePage.shouldShowIsSensitiveValue()
    })

    it('navigates back to the log hours page via start and end time section', function test() {
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      // And I click change
      page.clickChange('Start and end time')

      // Then I can see the log hours page
      Page.verifyOnPage(LogHoursPage, this.appointment)
    })

    it('navigates back to the log hours page via penalty hours section', function test() {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      // And I click change
      page.clickChange('Penalty hours')

      // Then I can see the log hours page
      Page.verifyOnPage(LogHoursPage, this.appointment)
    })

    it('navigates back to the log compliance page via compliance section', function test() {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      // And I click change
      page.clickChange('Compliance')

      // Then I can see the log compliance page
      const compliancePage = Page.verifyOnPage(LogCompliancePage, this.appointment)
      compliancePage.shouldShowEnteredAnswers(form.attendanceData)
    })
  })

  describe('submitting appointment update', function describe() {
    //  Scenario: submitting appointment update for a group placement
    it('Group placement appointment => submits update to application and shows success message on session page', function test() {
      const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1' })
      const appointment = appointmentFactory.build({ version: '1', alertActive: null })
      const project = projectFactory.build({
        projectCode: appointment.projectCode,
      })

      cy.task('stubFindProject', { project })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(appointment, form, '1')

      const session = sessionFactory.build({
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        projectCode: appointment.projectCode,
      })

      cy.task('stubFindSession', { session })

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      cy.task('stubUpdateAppointmentOutcome', { appointment })

      // And I click confirm
      page.clickSubmit('Confirm')

      // Then I can see the session page with success message
      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, session)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')
    })

    // Scenario: submitting appointment update for an individual placement
    it('Individual placement appointment => submits update to application and shows success message on project page', function test() {
      const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1' })
      const appointment = appointmentFactory.build({ version: '1', alertActive: null })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetForm', form)
      const project = projectFactory.build({
        projectCode: appointment.projectCode,
        projectType: { group: 'INDIVIDUAL' },
      })

      cy.task('stubFindProject', { project })

      const page = ConfirmDetailsPage.visit(appointment, form, '1')

      const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

      const request = {
        ...baseProjectAppointmentRequest(),
        projectCodes: [project.projectCode],
      }
      cy.task('stubGetAppointments', { request, pagedAppointments })

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      cy.task('stubUpdateAppointmentOutcome', { appointment })

      // And I click confirm
      page.clickSubmit('Confirm')

      // Then I can see the project page with success message
      const viewProjectPage = Page.verifyOnPage(ProjectPage, project)
      viewProjectPage.shouldShowSuccessMessage('Attendance recorded')
    })
  })

  describe('submitting appointment update that has been changed in Delius', function describe() {
    it('redirects to session page with error message if group placement', function test() {
      // Given the appointment version and the version saved on the form do not match
      const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1' })
      const appointment = appointmentFactory.build({ version: '2' })
      const project = projectFactory.build({
        projectCode: appointment.projectCode,
      })

      // And I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetForm', form)

      cy.task('stubFindProject', { project })

      const page = ConfirmDetailsPage.visit(appointment, form, '1')

      const session = sessionFactory.build({
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        projectCode: appointment.projectCode,
      })

      cy.task('stubFindSession', { session })

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      cy.task('stubUpdateAppointmentOutcome', { appointment })

      // And I click confirm
      page.clickSubmit('Confirm')

      // Then I can see the session page with error message
      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, session)
      viewSessionPage.shouldShowErrorMessage(
        'The arrival time has already been updated in the database, try again.',
        false,
      )
    })

    it('redirects to session page with error message if individual placement', function test() {
      // Given the appointment version and the version saved on the form do not match
      const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1' })
      const appointment = appointmentFactory.build({ version: '2' })
      const project = projectFactory.build({
        projectCode: appointment.projectCode,
        projectType: { group: 'INDIVIDUAL' },
      })

      cy.task('stubFindProject', { project })

      // And I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(appointment, form, '1')

      const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

      const request = {
        ...baseProjectAppointmentRequest(),
        projectCodes: [project.projectCode],
      }
      cy.task('stubGetAppointments', { request, pagedAppointments })

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      cy.task('stubUpdateAppointmentOutcome', { appointment })

      // And I click confirm
      page.clickSubmit('Confirm')

      // Then I can see the session page with error message
      const viewSessionPage = Page.verifyOnPage(ProjectPage, project)
      viewSessionPage.shouldShowErrorMessage(
        'The arrival time has already been updated in the database, try again.',
        false,
      )
    })
  })
})
