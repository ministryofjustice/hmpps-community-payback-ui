//  Feature: Delete an adjustment
//    As a case administrator
//    I want to delete an adjustment
//    So that I can correctly track all time completed for an unpaid work order
//
//  Scenario: viewing the 'Delete adjustment' page from the adjustments tab
//    Given I am on the adjustments tab of the view appointments page
//    When I click 'Delete' on an adjustment
//    Then I see the 'Delete adjustment' page
//    And I see the adjustment details
//
//  Scenario: deleting an adjustment
//    When I visit the 'Delete adjustment' page
//    And I submit the form
//    Then I see the adjustments tab
//    With a success banner
//
//  Scenario: navigating back to the adjustments tab via 'Cancel'
//    When I visit the 'Delete adjustment' page
//    And I click cancel
//    Then I see the adjustments tab
//
//  Scenario: handling a 400 error on deleting an adjustment
//    When I visit the 'Delete adjustment' page
//    And I submit the form
//    Then I see an appropriate error message

import Offender from '../../../server/models/offender'
import adjustmentFactory from '../../../server/testutils/factories/adjustmentFactory'
import caseDetailsSummaryFactory from '../../../server/testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../../../server/testutils/factories/offenderFullFactory'
import pagedModelAdjustmentFactory from '../../../server/testutils/factories/pagedModelAdjustmentFactory'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import unpaidWorkDetailsFactory from '../../../server/testutils/factories/unpaidWorkDetailsFactory'
import Page from '../../pages/page'
import ViewAppointmentsPage from '../../pages/appointments/viewAppointmentsPage'
import DeleteAdjustmentPage from '../../pages/people/deleteAdjustmentPage'

context('Delete adjustment', () => {
  const deliusEventNumber = '1'
  const offenderDto = offenderFullFactory.build({ crn: 'X123456' })
  const offender = new Offender(offenderDto)
  const adjustment = adjustmentFactory.build({
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

    cy.task('stubGetAdjustments', {
      pagedAdjustments: pagedModelAdjustmentFactory.build({ content: [adjustment, adjustmentFactory.build()] }),
      crn: offender.crn,
      deliusEventNumber,
      request: {},
    })
    cy.task('stubGetAppointments', {
      request: { crn: offender.crn, outcomeCodes: ['NO_OUTCOME'], eventNumber: deliusEventNumber },
      pagedAppointments: pagedModelAppointmentSummaryFactory.build(),
    })

    cy.signIn()
  })

  // Scenario: viewing the 'Delete adjustment' page from the adjustments tab
  it('shows the delete adjustment page when clicking delete on the adjustments tab', () => {
    // Given I am on the adjustments tab of the view appointments page
    const appointmentsPage = ViewAppointmentsPage.visit(offenderDto, deliusEventNumber, 'adjustments')

    // When I click 'Delete' on an adjustment
    appointmentsPage.clickDeleteAdjustment(adjustment)

    // Then I see the 'Delete adjustment' page
    const page = Page.verifyOnPage(DeleteAdjustmentPage, offender)

    // And I see the adjustment details
    page.shouldShowAdjustmentDetails(adjustment, '1 hour 30 minutes')
  })

  // Scenario: deleting an adjustment
  it('allows an adjustment to be deleted', () => {
    cy.task('stubDeleteAdjustment')

    // When I visit the 'Delete adjustment' page
    const page = DeleteAdjustmentPage.visit(offenderDto, deliusEventNumber, adjustment)

    // And I submit the form
    page.clickSubmit()

    // Then I see the adjustments tab
    const appointmentsPage = Page.verifyOnPage(ViewAppointmentsPage, offender)
    appointmentsPage.shouldBeOnAdjustmentsTab()

    // With a success banner
    appointmentsPage.shouldShowSuccessMessage('Adjustment has been deleted')
  })

  // Scenario: navigating back to the adjustments tab via 'Cancel'
  it('navigates back to the adjustments tab', () => {
    // When I visit the 'Delete adjustment' page
    const page = DeleteAdjustmentPage.visit(offenderDto, deliusEventNumber, adjustment)

    // And I click cancel
    page.clickCancel()

    // Then I see the adjustments tab
    Page.verifyOnPage(ViewAppointmentsPage, offender).shouldBeOnAdjustmentsTab()
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
