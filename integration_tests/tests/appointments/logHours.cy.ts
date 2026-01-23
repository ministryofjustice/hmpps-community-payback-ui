//  Feature: Update log hours
//    As a case administrator
//    I want to update the log hours on for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Validating the log hours page - attended
//    Given I am on the log hours page for an appointment with an attended outcome
//    And I do not enter a valid start, end or penalty time
//    When I submit the form
//    Then I see the log hours page with errors

//  Scenario: Validating the log hours page - not attended
//    Given I am on the log hours page for an appointment with a not attended outcome
//    And I do not enter a valid start or end time
//    When I submit the form
//    Then I see the log hours page with errors

//  Scenario: viewing the log hours page after entering 'Acceptable absence - stood down' contact outcome
//    Given I am on the log hours page for an appointment with a contact outcome of 'Acceptable absence - stood down'
//    Then I see the start and end times as read-only

//  Scenario: Scenario: Completing the log hours page - attended
//    Given I am on the log hours page for an appointment with an attended outcome
//    And I enter a start and end time
//    And I enter penalty hours
//    When I submit the form
//    Then I see the log compliance page

//  Scenario: Scenario: Completing the log hours page - not attended
//    Given I am on the log hours page for an appointment with a not attended outcome
//    And I enter a start and end time
//    When I submit the form
//    Then I see the confirm page

//  Scenario: Returning to the project details page
//    Given I am on the log hours page for an appointment
//    When I click back
//    Then I see the attendance outcome page

import LogHoursPage from '../../pages/appointments/logHoursPage'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import Page from '../../pages/page'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../server/testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'

context('Log hours', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build()
    cy.wrap(appointment).as('appointment')
  })

  beforeEach(function test() {
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', this.form)
  })

  describe('Validation', function type() {
    describe('attended', function describe() {
      // Scenario: Validating the log hours page
      it('validates form data', function test() {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
        })

        cy.task('stubGetForm', form)

        // Given I am on the log hours page for an appointment with an attended outcome
        const page = LogHoursPage.visit(this.appointment)

        // And I do not enter a valid start, end or penalty time
        page.enterStartTime('0')
        page.enterEndTime('1')
        page.enterPenaltyTime('-1', '400')

        // When I submit the form
        page.clickSubmit()

        // Then I see the log hours page with errors
        page.shouldShowErrorSummary('startTime', 'Enter a valid start time, for example 09:00')
        page.shouldShowErrorSummary('endTime', 'Enter a valid end time, for example 17:00')
        page.shouldShowErrorSummary('penaltyTimeHours', 'Enter valid hours for penalty hours, for example 2')
        page.shouldShowErrorSummary('penaltyTimeMinutes', 'Enter valid minutes for penalty hours, for example 30')
      })
    })

    describe('not attended', function describe() {
      // Scenario: Validating the log hours page
      it('validates form data', function test() {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false }),
        })

        cy.task('stubGetForm', form)

        // Given I am on the log hours page for an appointment with a not attended outcome
        const page = LogHoursPage.visit(this.appointment)

        // And I do not enter a valid start or end time
        page.enterStartTime('0')
        page.enterEndTime('1')
        page.shouldNotShowPenaltyHours()

        // When I submit the form
        page.clickSubmit()

        // Then I see the log hours page with errors
        page.shouldShowErrorSummary('startTime', 'Enter a valid start time, for example 09:00')
        page.shouldShowErrorSummary('endTime', 'Enter a valid end time, for example 17:00')
      })
    })
  })

  describe('Acceptable absence - stood down (AASD)', function describe() {
    //  Scenario: viewing the log hours page after entering 'Acceptable absence - stood down' contact outcome
    it('renders start/end times as read-only', function test() {
      //  Given I am on the log hours page for an appointment with a contact outcome of 'Acceptable absence - stood down'
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: false, code: 'AASD' }),
      })

      cy.task('stubGetForm', form)

      const page = LogHoursPage.visit(this.appointment)

      //  Then I see the start and end times as read-only
      page.shouldShowReadOnlyStartAndEndTimes(form.startTime, form.endTime)
    })
  })

  describe('Submit', function action() {
    // Scenario: Completing the log hours page - attended
    describe('attended', function describe() {
      it('submits the form and navigates to log compliance', function test() {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
        })

        // Given I am on the log hours page for an appointment with an attended outcome
        cy.task('stubGetForm', form)
        const page = LogHoursPage.visit(this.appointment)

        // And I enter a start and end time
        page.enterStartTime('09:00')
        page.enterEndTime('17:00')

        // And I enter penalty hours
        page.enterPenaltyTime('2', '30')

        cy.task('stubSaveForm')
        // When I submit the form
        page.clickSubmit()

        // Then I see the log compliance page
        Page.verifyOnPage(LogCompliancePage, this.appointment)
      })
    })

    describe('did not attend', function describe() {
      // Scenario: Completing the log hours page - not attended
      it('not enforceable => submits the form and navigates to confirm page', function test() {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false, enforceable: false }),
        })

        // Given I am on the log hours page for an appointment with a not attended outcome
        cy.task('stubGetForm', form)
        const page = LogHoursPage.visit(this.appointment)

        // And I enter a start and end time
        page.enterStartTime('09:00')
        page.enterEndTime('17:00')

        cy.task('stubSaveForm')
        // When I submit the form
        page.clickSubmit()

        // Then I see the confirm details page
        Page.verifyOnPage(ConfirmDetailsPage, this.appointment)
      })
    })
  })

  //  Scenario: Returning to project details page
  it('navigates back to the previous page', function test() {
    // Given I am on the log hours page for an appointment
    const page = LogHoursPage.visit(this.appointment)
    const contactOutcomes = contactOutcomesFactory.build()
    const [selected] = contactOutcomes.contactOutcomes

    // When I click back
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    cy.task('stubGetForm', appointmentOutcomeFormFactory.build({ contactOutcome: selected }))

    page.clickBack()

    // Then I see the attendance outcome page
    const attendancePage = Page.verifyOnPage(AttendanceOutcomePage, this.appointment)
    attendancePage.contactOutcomeOptions.shouldHaveSelectedValue(selected.code)
  })
})
