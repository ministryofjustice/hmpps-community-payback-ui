//  Feature: Update attendance outcome
//    As a case administrator
//    I want to update the attendance outcome on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the attendance outcome page
//    Given I am on the attendance outcome page for an appointment
//    And I do not select an outcome
//    And I enter notes
//    When I submit the form
//    Then I see the attendance outcome page with errors

//  Scenario: Validating updating a future appointment with an attended outcome
//    Given I am on the attendance outcome page for an appointment in the future
//    And I complete the form with an outcome that is attended
//    When I submit the form
//    Then I see the attendance outcome page with errors

//  Scenario: Validating updating a future appointment with an enforceable outcome
//    Given I am on the attendance outcome page for an appointment in the future
//    And I complete the form with an outcome that is enforceable
//    When I submit the form
//    Then I see the attendance outcome page with errors

//  Scenario: Completing the attendance outcome page (attended)
//    Given I am on the attendance outcome page for an appointment
//    And I complete the form with an attended outcome
//    When I submit the form
//    Then I see the log time page

//  Scenario: Completing the attendance outcome page (not attended)
//    Given I am on the attendance outcome page for an appointment
//    And I complete the form with a not attended outcome
//    When I submit the form
//    Then I see the confirm details page

//  Scenario: Returning to the choose supervisor page
//    Given I am on the attendance outcome page for an appointment
//    When I click back
//    Then I see the choose supervisor page

import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import Page from '../../pages/page'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import { ContactOutcomeDto } from '../../../server/@types/shared'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import providerTeamSummaryFactory from '../../../server/testutils/factories/providerTeamSummaryFactory'

context('Attendance outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build({ id: 1001, sensitive: undefined })
    cy.wrap(appointment).as('appointment')

    const attendedOutcome = contactOutcomeFactory.build({ attended: true })
    const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [attendedOutcome] })
    cy.wrap(contactOutcomes).as('contactOutcomes')
  })

  beforeEach(function test() {
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetContactOutcomes', { contactOutcomes: this.contactOutcomes })
    cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build({ isSensitive: undefined }))
  })

  // Scenario: Validating the attendance outcome page
  it('validates form data', function test() {
    const notes = 'Test note'
    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // And I do not select an outcome

    // And I enter notes
    page.notesQuestions.notesField().type(notes)
    page.notesQuestions.checkIsSensitive()

    // When I submit the form
    page.clickSubmit()

    // Then I see the attendance outcome page with errors
    page.shouldShowErrorSummary('attendanceOutcome', 'Select an attendance outcome')
    page.contactOutcomeOptions.shouldNotHaveASelectedValue()
    page.notesQuestions.shouldShowNotes(notes)
    page.notesQuestions.shouldShowIsSensitiveValue()
  })

  // Scenario: Validating updating a future appointment with an attended outcome
  it('validates updating a future appointment with an attended outcome', function test() {
    const contactOutcomes = contactOutcomesFactory.build({
      contactOutcomes: [contactOutcomeFactory.build({ attended: true }), contactOutcomeFactory.build()],
    })
    cy.task('stubGetContactOutcomes', { contactOutcomes })

    // Given I am on the attendance outcome page for an appointment in the future
    const appointmentInTheFuture = appointmentFactory.build({
      date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
      sensitive: undefined,
    })

    cy.task('stubFindAppointment', { appointment: appointmentInTheFuture })
    const page = AttendanceOutcomePage.visit(appointmentInTheFuture)

    // And I complete the form with an outcome that is attended
    const attendedOutcomeCode = contactOutcomes.contactOutcomes.filter((o: ContactOutcomeDto) => o.attended)[0].code
    page.completeForm(attendedOutcomeCode)

    // When I submit the form
    page.clickSubmit()

    // Then I see the attendance outcome page with errors
    page.shouldShowErrorSummary('attendanceOutcome', 'The outcome entered must be: acceptable absence')
  })

  // Scenario: Validating updating a future appointment with an enforceable outcome
  it('validates updating a future appointment with an enforceable outcome', function test() {
    const contactOutcomes = contactOutcomesFactory.build({
      contactOutcomes: [contactOutcomeFactory.build({ enforceable: true }), contactOutcomeFactory.build()],
    })
    cy.task('stubGetContactOutcomes', { contactOutcomes })

    // Given I am on the attendance outcome page for an appointment in the future
    const appointmentInTheFuture = appointmentFactory.build({
      date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
      sensitive: undefined,
    })

    cy.task('stubFindAppointment', { appointment: appointmentInTheFuture })
    const page = AttendanceOutcomePage.visit(appointmentInTheFuture)

    // And I complete the form with an outcome that is enforceable
    const enforceableOutcomeCode = contactOutcomes.contactOutcomes.filter((o: ContactOutcomeDto) => o.enforceable)[0]
      .code
    page.completeForm(enforceableOutcomeCode)

    // When I submit the form
    page.clickSubmit()

    // Then I see the attendance outcome page with errors
    page.shouldShowErrorSummary('attendanceOutcome', 'The outcome entered must be: acceptable absence')
  })

  // Scenario: Completing the attendance outcome page (attended)
  it('submits the form and navigates to the next page', function test() {
    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // And I complete the form with an attended outcome
    page.completeForm(this.contactOutcomes.contactOutcomes[0].code)

    cy.task('stubSaveAppointmentForm')
    // When I submit the form
    page.clickSubmit()

    // Then I see the log time page
    Page.verifyOnPage(LogHoursPage, this.appointment)
  })

  // Scenario: Completing the attendance outcome page (not attended)
  it('submits the form and navigates to the next page', function test() {
    const notAttendedOutcome = contactOutcomeFactory.build({ attended: false })
    const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [notAttendedOutcome] })
    cy.task('stubGetContactOutcomes', { contactOutcomes })

    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // And I complete the form with a not attended outcome
    page.completeForm(contactOutcomes.contactOutcomes[0].code)

    cy.task('stubSaveAppointmentForm')
    // When I submit the form
    page.clickSubmit()

    // Then I see the confirm details page
    Page.verifyOnPage(ConfirmDetailsPage, this.appointment)
  })

  //  Scenario: Returning to choose supervisor page
  it('navigates back to the previous page', function test() {
    const supervisors = supervisorSummaryFactory.buildList(2)
    const project = projectFactory.build({
      projectCode: this.appointment.projectCode,
      providerCode: this.appointment.providerCode,
    })

    // Given I am on the attendance outcome page for an appointment
    const page = AttendanceOutcomePage.visit(this.appointment)

    // When I click back
    cy.task('stubGetSupervisors', {
      teamCode: this.appointment.supervisingTeamCode,
      providerCode: this.appointment.providerCode,
      supervisors,
    })
    cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build())
    cy.task('stubFindProject', { project })

    const teams = providerTeamSummaryFactory.buildList(2)
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.appointment.providerCode })

    const provider = providerSummaryFactory.build({ code: this.appointment.providerCode })
    cy.task('stubGetProviders', { providers: { providers: [provider] } })

    page.clickBack()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, this.appointment)
  })

  describe('Is sensitive questions', () => {
    it('does not show sensitivity options if appointment already has sensitive value', function test() {
      const appointment = appointmentFactory.build({ sensitive: true })
      cy.task('stubFindAppointment', { appointment })

      // Given I am on the attendance outcome page for an appointment
      const page = AttendanceOutcomePage.visit(appointment)

      // Then I should not see the is sensitive question
      page.notesQuestions.shouldNotShowIsSensitiveQuestion()
    })

    it('does show sensitivity options if appointment sensitive value is undefined', function test() {
      const appointment = appointmentFactory.build({ sensitive: false })
      cy.task('stubFindAppointment', { appointment })
      const form = appointmentOutcomeFormFactory.build({ isSensitive: undefined })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the attendance outcome page for an appointment
      const page = AttendanceOutcomePage.visit(appointment)

      // Then I should see the is sensitive question
      page.notesQuestions.shouldShowIsSensitiveQuestion()
    })
  })
})
