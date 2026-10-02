//  Feature: Confirm details for an ETE activity appointment
//    As a case administrator
//    I want to confirm the details of an ETE activity appointment
//    So that the appointment is recorded

// Scenario: viewing the confirm details page
//    Given I am on the confirm details page for an ETE activity
//    Then I see the entered details
//    And the region row is not displayed as the user was not shown the question

// Scenario: viewing the region answer
//    Given I am on the confirm details page for an ETE activity
//    Then I see the entered region details as the user was shown the question

// Scenario: Validating the confirm details page
//    Given I am on the confirm details page for an ETE activity
//    And I do not choose whether to send an alert
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can navigate back to the previous page
//    Given I am on the confirm details page for an ETE activity
//    When I click back
//    Then I see the log compliance page

// Scenario: submitting the appointment
//    Given I am on the confirm details page for an ETE activity
//    And I choose whether to send an alert
//    When I click confirm
//    Then the appointment is created
//    And I see the person's appointments page with a success message

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import { contactOutcomeFactory } from '../../../../server/testutils/factories/contactOutcomeFactory'
import Offender from '../../../../server/models/offender'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'
import ConfirmPage from '../../../pages/appointments/otherEte/confirmPage'
import CompliancePage from '../../../pages/appointments/otherEte/compliancePage'
import ViewAppointmentsPage from '../../../pages/appointments/viewAppointmentsPage'
import Page from '../../../pages/page'

context('Other ETE activity - Confirm details', () => {
  const deliusEventNumber = '2'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({
      crn: offender.crn,
      deliusEventNumber,
      projectTypeGroup: 'OTHER_ETE',
      contactOutcome: contactOutcomeFactory.build({ attended: true }),
      attendanceData: { workQuality: 'GOOD', behaviour: 'NOT_APPLICABLE' },
      originalPath: undefined,
    })
    cy.wrap(form).as('form')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
  })

  // Scenario: viewing the confirm details page
  it('shows the entered details', function test() {
    // Given I am on the confirm details page for an ETE activity
    const page = ConfirmPage.visit(this.offender)

    // Then I see the entered details
    page.shouldShowCompletedDetails(this.form)

    // And the region row is not displayed as the user was not shown the question
    page.formDetails.shouldNotContainRowWithLabel('Region')
  })

  // Scenario: viewing the region answer
  it('includes region detail if the question is set to be shown', function test() {
    const form = createAppointmentFormFactory.build({ ...this.form, options: { showRegionQuestion: true } })
    cy.task('stubGetAppointmentForm', form)
    // Given I am on the confirm details page for an ETE activity
    const page = ConfirmPage.visit(this.offender)

    // Then I see the entered region details
    page.formDetails.getValueWithLabel('Region').should('contain.text', form.provider.name)
  })

  // Scenario: Validating the confirm details page
  it('shows validation messages', function test() {
    // Given I am on the confirm details page for an ETE activity
    const page = ConfirmPage.visit(this.offender)

    // And I do not choose whether to send an alert
    // When I submit the form
    page.clickSubmit('Confirm')

    // Then I see the same page with errors
    page.shouldShowValidationError()
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on the confirm details page for an ETE activity
    const page = ConfirmPage.visit(this.offender)

    // When I click back
    page.clickBack()

    // Then I see the log compliance page
    Page.verifyOnPage(CompliancePage, this.offender)
  })

  // Scenario: submitting the appointment
  it('creates the appointment and shows the appointments page with a success message', function test() {
    cy.task('stubCreateAppointment')

    const request = {
      crn: this.offender.crn,
      eventNumber: deliusEventNumber,
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    }
    const noOutcomeRequest = {
      crn: this.offender.crn,
      outcomeCodes: ['NO_OUTCOME'],
      eventNumber: deliusEventNumber,
    }
    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: appointmentSummaryFactory.buildList(1),
    })
    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // Given I am on the confirm details page for an ETE activity
    const page = ConfirmPage.visit(this.offender)

    // And I choose whether to send an alert
    page.alertPractitionerQuestion.checkOptionWithValue('yes')

    // When I click confirm
    page.clickSubmit('Confirm')

    // Then the appointment is created
    // And I see the person's appointments page with a success message
    const viewAppointmentsPage = Page.verifyOnPage(ViewAppointmentsPage, new Offender(this.offender))
    viewAppointmentsPage.shouldShowSuccessMessage('Attendance recorded')
  })
})
