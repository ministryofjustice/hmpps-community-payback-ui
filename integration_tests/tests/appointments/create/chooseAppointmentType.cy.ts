//  Feature: Choose appointment type for a new appointment
//    As a case administrator
//    I want to choose the type of appointment I am creating
//    So that I can continue creating the correct kind of appointment

// Scenario: selecting an appointment type and continuing
//    Given I am on the choose appointment type page
//    And I select an appointment type
//    When I submit the form
//    Then I see the date page

// Scenario: not selecting an appointment type
//    Given I am on the choose appointment type page
//    When I submit the form without selecting a type
//    Then I see the same page with a validation error

// Scenario: navigating back
//    Given I am on the choose appointment type page
//    When I click back
//    Then I see the person's appointments page

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import Offender from '../../../../server/models/offender'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'
import ChooseAppointmentTypePage from '../../../pages/appointments/chooseAppointmentTypePage'
import DatePage from '../../../pages/appointments/datePage'
import ViewAppointmentsPage from '../../../pages/appointments/viewAppointmentsPage'
import Page from '../../../pages/page'

context('Create appointment - Choose appointment type', () => {
  const deliusEventNumber = '1'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
  })

  // Scenario: selecting an appointment type and continuing
  it('can select an appointment type and continue', function test() {
    cy.task('stubGetProviders', { providers: { providers: providerSummaryFactory.buildList(1) } })
    cy.task('stubSaveAppointmentForm')

    const form = createAppointmentFormFactory.build({
      crn: this.offender.crn,
      deliusEventNumber,
      originalParams: { crn: this.offender.crn, deliusEventNumber },
    })
    cy.task('stubGetAppointmentForm', form)

    // Given I am on the choose appointment type page
    const page = ChooseAppointmentTypePage.visit(this.offender, deliusEventNumber)

    // And I select an appointment type
    page.completeForm()

    // When I submit the form
    page.clickSubmit()

    // Then I see the date page
    Page.verifyOnPage(DatePage, { offender: this.offender })
  })

  // Scenario: not selecting an appointment type
  it('shows a validation error when no appointment type is selected', function test() {
    // Given I am on the choose appointment type page
    const page = ChooseAppointmentTypePage.visit(this.offender, deliusEventNumber)

    // When I submit the form without selecting a type
    page.clickSubmit()

    // Then I see the same page with a validation error
    page.shouldShowValidationError()
  })

  // Scenario: navigating back
  it('goes back to the person appointments page', function test() {
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

    // Given I am on the choose appointment type page
    const page = ChooseAppointmentTypePage.visit(this.offender, deliusEventNumber)

    // When I click back
    page.clickBack()

    // Then I see the person's appointments page
    Page.verifyOnPage(ViewAppointmentsPage, new Offender(this.offender))
  })
})
