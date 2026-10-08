// Feature: adjust non-travel-time hours
//   As a case administrator
//   I want to adjust a person's remaining requirement hours
//   So that I can correctly track all time completed for an unpaid work order

// Scenario: submitting the adjustment
//   Given I am on the adjust hours page
//   When I complete the form
//   And I am taken to the confirm page
//   Then I can submit the adjustment
//   And I am taken to the view appointments page with a confirmation

// Scenario: revisiting the adjust hours form from the confirm page
//   Given I am on the adjust hours page
//   When I complete the form
//   And I am taken to the confirm page
//   Then I can click a 'change' link
//   And I am taken back to the adjust hours page

// Scenario: incomplete adjust hours form yields errors
//   Given I am on the adjust hours page
//   And I submit the form without completing it
//   Then I should see errors

// Scenario: showing the adjust hours page by clicking 'Adjust hours' from the view appointments page
//   Given I am on the view appointments page
//   And I click the 'Adjust hours' button
//   Then I should see the adjust hours page

// Scenario: navigating back to the view appointments page
//   Given I am on the adjust hours page
//   And I click back
//   Then I should see the view appointments page

// Scenario: navigating back to the adjust hours page
//   Given I am on the adjust hours confirm page
//   And I click back
//   Then I should see the adjust hours page

import Offender from '../../../server/models/offender'
import caseDetailsSummaryFactory from '../../../server/testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../../../server/testutils/factories/offenderFullFactory'
import unpaidWorkDetailsFactory from '../../../server/testutils/factories/unpaidWorkDetailsFactory'
import Page from '../../pages/page'
import AdjustHoursConfirmPage from '../../pages/people/adjustHoursConfirmPage'
import AdjustHoursPage from '../../pages/people/adjustHoursPage'
import reasons from '../../fixtures/adjustmentReasons.json'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import ViewAppointmentsPage from '../../pages/appointments/viewAppointmentsPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

context('Adjust Hours', () => {
  const deliusEventNumber = '1'
  const offenderDto = offenderFullFactory.build({
    crn: 'X123456',
  })
  const offender = new Offender(offenderDto)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetAdjustmentForm', {
      type: 'Negative',
      minutes: 30,
      adjustmentDate: '2026-01-01',
      adjustmentReasonId: 'H',
    })
    cy.task('stubSaveAdjustmentForm', {
      type: 'Negative',
      minutes: 30,
      adjustmentDate: '2026-01-01',
      adjustmentReasonId: 'H',
    })

    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      unpaidWorkDetails: [
        unpaidWorkDetailsFactory.build({
          eventNumber: parseInt(deliusEventNumber, 10),
          requiredMinutes: 1000,
          completedMinutes: 500,
        }),
      ],
      offender: offenderDto,
    })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAdjustmentReasons')

    const noOutcomeRequest = {
      crn: offender.crn,
      outcomeCodes: ['NO_OUTCOME'],
      eventNumber: deliusEventNumber,
    }

    const request = {
      crn: offender.crn,
      eventNumber: deliusEventNumber,
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    }

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: appointmentSummaryFactory.buildList(5),
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    cy.signIn()
  })

  // Scenario: submitting the adjustment
  it('submits the adjustment', () => {
    // Given I am on the adjust hours page
    AdjustHoursPage.visit(offenderDto, deliusEventNumber)
    const page = Page.verifyOnPage(AdjustHoursPage, offender)

    // When I complete the form
    page.completeForm('01/01/2026', 'H', '0', '30')
    page.clickSubmit()

    // And I am taken to the confirm page
    const confirmPage = Page.verifyOnPage(AdjustHoursConfirmPage, offender)

    const reason = reasons.filter(r => r.deliusCode === 'H')[0]
    confirmPage.checkRemainingHoursCalculation(470)
    confirmPage.checkSummary('2026-01-01', reason.name, '30 minutes')

    const appointment = appointmentFactory.build({
      offender,
      deliusEventNumber: parseInt(deliusEventNumber, 10),
    })

    cy.task('stubSaveAdjustment', { appointment })

    // Then I can submit the adjustment
    confirmPage.clickSubmit('Submit')

    // And I am taken to the view appointments page with a confirmation
    const appointmentsPage = Page.verifyOnPage(ViewAppointmentsPage, offender)
    appointmentsPage.shouldShowSuccessMessage('Adjustment recorded')
  })

  // Scenario: revisiting the adjust hours form from the confirm page
  it('allows the form to be revisited from the adjust hours confirm page', () => {
    // Given I am on the adjust hours page
    AdjustHoursPage.visit(offenderDto, deliusEventNumber)
    const page = Page.verifyOnPage(AdjustHoursPage, offender)

    // When I complete the form
    page.completeForm('01/01/2026', 'H', '0', '30')
    page.clickSubmit()

    // And I am taken to the confirm page
    const confirmPage = Page.verifyOnPage(AdjustHoursConfirmPage, offender)

    // Then I can click a 'change' link
    confirmPage.clickChangeLink()

    // And I am taken back to the adjust hours page
    Page.verifyOnPage(AdjustHoursPage, offender)
  })

  // Scenario: incomplete adjust hours form yields errors
  it('shows errors when submitting the adjust hours page without filling out the form', () => {
    // Given I am on the adjust hours page
    AdjustHoursPage.visit(offenderDto, deliusEventNumber)
    const page = Page.verifyOnPage(AdjustHoursPage, offender)

    // And I submit the form without completing it
    page.clickSubmit()

    // Then I should see errors
    page.shouldShowErrorSummary('date', 'Enter or select a date')
    page.shouldShowErrorSummary('reasonCode', 'Select a reason')
    page.shouldShowErrorSummary('hours', 'Enter hours and minutes for time taken off')
  })

  // Scenario: showing the adjust hours page by clicking 'Adjust hours' from the view appointments page
  it('shows the adjust hours page when you click the adjust hours button on the view appointments page', () => {
    // Given I am on the view appointments page
    const page = ViewAppointmentsPage.visit(offenderDto, deliusEventNumber, 'upcoming')

    // And I click the 'Adjust hours' button
    page.clickAdjustHours()

    // Then I should see the adjust hours page
    Page.verifyOnPage(AdjustHoursPage, offender)
  })

  // Scenario: navigating back to the view appointments page
  it('navigates back to the view appointments page from the adjust hours page', () => {
    // Given I am on the adjust hours page
    const page = AdjustHoursPage.visit(offenderDto, deliusEventNumber)

    // And I click back
    page.clickBack()

    // Then I should see the view appointments page
    Page.verifyOnPage(ViewAppointmentsPage, offender)
  })

  // Scenario: navigating back to the adjust hours page
  it('navigates back to the adjust hours page from the adjust hours confirm page', () => {
    // Given I am on the adjust hours confirm page
    const page = AdjustHoursConfirmPage.visit(offenderDto, deliusEventNumber)

    // And I click back
    page.clickBack()

    // Then I should see the adjust hours page
    Page.verifyOnPage(AdjustHoursPage, offender)
  })
})
