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
// Scenario: submitting appointment update
//    Given I am on the confirm page of an in progress update
//    And I click confirm
//    Then I can see the session page with success message

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../../server/testutils/factories/attendanceDataFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import Page from '../../pages/page'
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
        penaltyTime: '01:00',
        workedIntensively: false,
        workQuality: 'GOOD',
        behaviour: 'NOT_APPLICABLE',
      }),
      contactOutcome: contactOutcomeFactory.build({
        attended: true,
      }),
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
        penaltyTime: '01:00',
        workedIntensively: false,
      }),
      contactOutcome: contactOutcomeFactory.build({
        attended: false,
      }),
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

      // Then I can see the log compliance questions
      Page.verifyOnPage(LogCompliancePage, this.appointment)
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
    it('navigates back to the project details page', function test() {
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        teamCode: this.appointment.supervisingTeamCode,
        providerCode: this.appointment.providerCode,
        supervisors,
      })

      // And I click change
      page.clickChange('Supervising officer')

      // Then I can see the project details page
      const projectDetailsPage = Page.verifyOnPage(CheckProjectDetailsPage, this.appointment)
      projectDetailsPage.shouldContainProjectDetails()
    })

    it('navigates back to the log attendance page', function test() {
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      const contactOutcomes = contactOutcomesFactory.build()
      cy.task('stubGetContactOutcomes', { contactOutcomes })

      // And I click change
      page.clickChange('Attendance')

      // Then I can see the log attendance page
      Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
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

    it('navigates back to the log compliance page', function test() {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')

      // And I click change
      page.clickChange('Compliance')

      // Then I can see the log compliance page
      Page.verifyOnPage(LogCompliancePage, this.appointment)
    })
  })

  describe('submitting appointment update', function describe() {
    it('submits update to application and shows success message', function test() {
      const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1' })
      const appointment = appointmentFactory.build({ version: '1' })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: appointment })
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

      cy.task('stubUpdateAppointmentOutcome', { appointment: appointment })

      // And I click confirm
      page.clickSubmit('Confirm')

      // Then I can see the session page with success message
      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, session)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')
    })
  })
})
