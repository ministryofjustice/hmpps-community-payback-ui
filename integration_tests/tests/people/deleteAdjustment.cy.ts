//  Feature: Delete an adjustment
//    As a case administrator
//    I want to delete an adjustment
//    So that I can correctly track all time completed for an unpaid work order
//
//  Scenario: viewing the 'Delete adjustment' page
//    When I visit the 'Delete adjustment' page
//    Then I see the adjustment details
//
//  Scenario: deleting an adjustment
//    When I visit the 'Delete adjustment' page
//    And I submit the form
//    Then I see the view appointments page
//    With a success banner
//
//  Scenario: navigating back to the view appointments page via 'Cancel'
//    When I visit the 'Delete adjustment' page
//    And I click cancel
//    Then I see the view appointments page
//
//  Scenario: handling a 400 error on deleting an adjustment
//    When I visit the 'Delete adjustment' page
//    And I submit the form
//    Then I see an appropriate error message

import Offender from '../../../server/models/offender'
import adjustmentFactory from '../../../server/testutils/factories/adjustmentFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import caseDetailsSummaryFactory from '../../../server/testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../../../server/testutils/factories/offenderFullFactory'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import unpaidWorkDetailsFactory from '../../../server/testutils/factories/unpaidWorkDetailsFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Page from '../../pages/page'
import ViewAppointmentsPage from '../../pages/appointments/viewAppointmentsPage'
import DeleteAdjustmentPage from '../../pages/people/deleteAdjustmentPage'

context('Delete adjustment', () => {
  const deliusEventNumber = '1'
  const offenderDto = offenderFullFactory.build({ crn: 'X123456' })
  const offender = new Offender(offenderDto)
  const adjustment = adjustmentFactory.build({
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    amount: 'PT-1H-30M',
    reason: 'Miscellaneous correction',
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      unpaidWorkDetails: [unpaidWorkDetailsFactory.build({ eventNumber: parseInt(deliusEventNumber, 10) })],
      offender: offenderDto,
    })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAdjustment', { adjustment })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: appointmentSummaryFactory.buildList(2),
    })
    cy.task('stubGetAppointments', {
      request: {
        crn: offender.crn,
        eventNumber: deliusEventNumber,
        fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
      },
      pagedAppointments,
    })
    cy.task('stubGetAppointments', {
      request: { crn: offender.crn, outcomeCodes: ['NO_OUTCOME'], eventNumber: deliusEventNumber },
      pagedAppointments,
    })

    cy.signIn()
  })

  // Scenario: viewing the 'Delete adjustment' page
  it('shows the delete adjustment page', () => {
    // When I visit the 'Delete adjustment' page
    const page = DeleteAdjustmentPage.visit(offenderDto, deliusEventNumber, adjustment)

    // Then I see the adjustment details
    page.shouldShowAdjustmentDetails(adjustment)
  })

  // Scenario: deleting an adjustment
  it('allows an adjustment to be deleted', () => {
    cy.task('stubDeleteAdjustment')

    // When I visit the 'Delete adjustment' page
    const page = DeleteAdjustmentPage.visit(offenderDto, deliusEventNumber, adjustment)

    // And I submit the form
    page.clickSubmit()

    // Then I see the view appointments page
    const appointmentsPage = Page.verifyOnPage(ViewAppointmentsPage, offender)

    // With a success banner
    appointmentsPage.shouldShowSuccessMessage('Adjustment has been deleted')
  })

  // Scenario: navigating back to the view appointments page via 'Cancel'
  it('navigates back to the view appointments page', () => {
    // When I visit the 'Delete adjustment' page
    const page = DeleteAdjustmentPage.visit(offenderDto, deliusEventNumber, adjustment)

    // And I click cancel
    page.clickCancel()

    // Then I see the view appointments page
    Page.verifyOnPage(ViewAppointmentsPage, offender)
  })

  // Scenario: handling a 400 error on deleting an adjustment
  it('handles a 400 error on the API', () => {
    cy.task('stubDeleteAdjustmentWithError', { userMessage: '400 error' })

    // When I visit the 'Delete adjustment' page
    const page = DeleteAdjustmentPage.visit(offenderDto, deliusEventNumber, adjustment)

    // And I submit the form
    page.clickSubmit()

    // Then I see an appropriate error message
    page.shouldShowErrorSummary('400 error')
  })
})
