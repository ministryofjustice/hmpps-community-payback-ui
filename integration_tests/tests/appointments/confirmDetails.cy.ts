//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Confirming an appointment update
//    Given I am on the confirm page of an in progress update
//    Then I can see my completed answers

//  Scenario: Confirming an appointment update without enforcement
//    Given I am on the confirm page of an in progress update without enforcement
//    Then I can see my completed answers without enforcement

// Scenario: navigating back from confirm - not enforceable
//    Given I am on the confirm page of an in progress update without enforcement
//    And I click back
//    Then I can see the log compliance questions

// Scenario: navigating back from confirm - enforceable
//    Given I am on the confirm page of an in progress update with enforcement
//    And I click back
//    Then I can see the enforcement questions
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
import appointmentOutcomeFormFactory, {
  enforcementOutcomeFormFactory,
} from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
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
import EnforcementPage from '../../pages/appointments/enforcementPage'
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

  // Scenario: Confirming an appointment update
  it('shows my completed answers for the current form', function test() {
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
        enforceable: true,
      }),
      enforcement: enforcementOutcomeFormFactory.build(),
    })

    // Given I am on the confirm page of an in progress update
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails()
    page.shouldShowEnforcementDetails()
  })

  // Scenario: Confirming an appointment update without enforcement
  it('shows my completed answers for the current form without enforcement', function test() {
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
      enforcement: undefined,
      contactOutcome: contactOutcomeFactory.build({
        enforceable: undefined,
      }),
    })

    // Given I am on the confirm page of an in progress update without enforcement
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my submitted answers without enforcement
    page.shouldShowCompletedDetails()
    page.shouldNotShowEnforcementDetails()
  })

  // Scenario: navigating back from confirm - not enforceable
  describe('navigating back', function describe() {
    it('returns to compliance page if contact outcome is not enforceable', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          enforceable: false,
        }),
      })

      // Given I am on the confirm page of an in progress update without enforcement
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click back
      page.clickBack()

      // Then I can see the log compliance questions
      Page.verifyOnPage(LogCompliancePage, this.appointment)
    })

    // Scenario: navigating back from confirm - enforceable
    it('returns to enforcement page if contact outcome is enforceable', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          enforceable: true,
        }),
      })

      // Given I am on the confirm page of an in progress update with enforcement
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click back
      page.clickBack()

      // Then I can see the enforcement questions
      const enforcementPage = Page.verifyOnPage(EnforcementPage, this.appointment)
      enforcementPage.shouldShowQuestions()
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
      page.checkOnPage()

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
      page.checkOnPage()

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
      page.checkOnPage()

      // And I click change
      page.clickChange('Start and end time')

      // Then I can see the log hours page
      Page.verifyOnPage(LogHoursPage, this.appointment)
    })

    it('navigates back to the log hours page via penalty hours section', function test() {
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click change
      page.clickChange('Penalty hours')

      // Then I can see the log hours page
      Page.verifyOnPage(LogHoursPage, this.appointment)
    })

    it('navigates back to the log compliance page', function test() {
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click change
      page.clickChange('Compliance')

      // Then I can see the log compliance page
      Page.verifyOnPage(LogCompliancePage, this.appointment)
    })

    it('navigates back to the enforcement page via enforcement section', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          enforceable: true,
        }),
      })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click change
      page.clickChange('Enforcement')

      // Then I can see the enforcement page
      const enforcementPage = Page.verifyOnPage(EnforcementPage, this.appointment)
      enforcementPage.shouldShowQuestions()
    })

    it('navigates back to the enforcement page via respond by section', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          enforceable: true,
        }),
      })

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click change
      page.clickChange('Respond by')

      // Then I can see the enforcement page
      const enforcementPage = Page.verifyOnPage(EnforcementPage, this.appointment)
      enforcementPage.shouldShowQuestions()
    })
  })

  describe('submitting appointment update', function describe() {
    it('submits update to application and shows success message', function test() {
      const form = appointmentOutcomeFormFactory.build()

      // Given I am on the confirm page of an in progress update
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      const session = sessionFactory.build({
        date: this.appointment.date,
        startTime: this.appointment.startTime,
        endTime: this.appointment.endTime,
        projectCode: this.appointment.projectCode,
      })

      cy.task('stubFindSession', { session })

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        providerCode: this.appointment.providerCode,
        teamCode: this.appointment.supervisingTeamCode,
        supervisors,
      })

      cy.task('stubUpdateAppointmentOutcome', { appointment: this.appointment })

      // And I click confirm
      page.clickSubmit('Confirm')

      // Then I can see the session page with success message
      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, session)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')
    })
  })
})
