//  Feature: Log hours for a new appointment
//    As a case administrator
//    I want to log the hours when creating a new appointment
//    So that I can track progress for an unpaid work order

// Scenario: Validating the log hours page
//    Given I am on the log hours page for a new appointment
//    And I do not enter a valid start or end time
//    When I submit the form
//    Then I see the log hours page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the log hours page for a new appointment
//    And I enter a start and end time
//    When I submit the form
//    Then I see the log compliance page

// Scenario: can navigate back to the previous page
//    Given I am on the log hours page for a new appointment
//    When I click back
//    Then I see the attendance outcome page

import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'

context('Create appointment - Log hours', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({
      crn: offender.crn,
      contactOutcome: contactOutcomeFactory.build({ attended: true }),
    })
    cy.wrap(form).as('form')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
  })

  // Scenario: Validating the log hours page
  it('shows validation messages', function test() {
    // Given I am on the log hours page for a new appointment
    const page = LogHoursPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I do not enter a valid start or end time
    page.enterStartTime('0')
    page.enterEndTime('1')

    // When I submit the form
    page.clickSubmit()

    // Then I see the log hours page with errors
    page.shouldShowErrorSummary('startTime', 'Enter a valid start time, for example 09:00')
    page.shouldShowErrorSummary('endTime', 'Enter a valid end time, for example 17:00')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    // Given I am on the log hours page for a new appointment
    const page = LogHoursPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I enter a start and end time
    page.enterStartTime('09:00')
    page.enterEndTime('17:00')

    cy.task('stubSaveAppointmentForm')

    // When I submit the form
    page.clickSubmit()

    // Then I see the log compliance page
    Page.verifyOnPage(LogCompliancePage, { offender: this.offender })
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [this.form.contactOutcome] })
    cy.task('stubGetContactOutcomes', { contactOutcomes })

    // Given I am on the log hours page for a new appointment
    const page = LogHoursPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // When I click back
    page.clickBack()

    // Then I see the attendance outcome page
    const attendancePage = Page.verifyOnPage(AttendanceOutcomePage, { offender: this.offender })
    attendancePage.contactOutcomeOptions.shouldHaveSelectedValue(this.form.contactOutcome.code)
  })
})
