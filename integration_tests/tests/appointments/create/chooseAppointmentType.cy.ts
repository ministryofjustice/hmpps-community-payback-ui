//  Feature: Choose appointment type for a new appointment
//    As a case administrator
//    I want to choose the type of appointment I am creating
//    So that I can continue creating the correct kind of appointment

// Scenario: navigating back
//    Given I am on the choose appointment type page
//    When I click back
//    Then I see the person's appointments page

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import Offender from '../../../../server/models/offender'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'
import ChooseAppointmentTypePage from '../../../pages/appointments/chooseAppointmentTypePage'
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
