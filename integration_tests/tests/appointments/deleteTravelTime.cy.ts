//  Feature: Delete travel time for an appointment
//    As a case administrator
//    I want to delete travel time for an appointment
//    So that I can correctly track all time completed for an unpaid work order
//
//  Scenario: viewing the 'Delete travel time' page
//    When I visit the 'Delete travel time' page
//    Then I see the travel time details
//    And I see the appointment details
//
//  Scenario: deleting a travel time adjustment
//    When I visit the 'Delete travel time' page
//    And I submit the form
//    Then I see the appointment details page
//    With a success banner
//
//  Scenario: navigating back to appointment details page via 'Cancel'
//    When I visit the 'Delete travel time' page
//    And I click cancel
//    Then I see the appointment details page
//
//  Scenario: handling a 400 error on deleting an adjustment
//    When I visit the 'Delete travel time' page
//    And I submit the form
//    I see an appropriate error message

import { ContactOutcomeDto, ProjectDto } from '../../../server/@types/shared'
import { ProviderSummaryDto } from '../../../server/@types/shared/models/ProviderSummaryDto'
import adjustmentFactory from '../../../server/testutils/factories/adjustmentFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import caseDetailsSummaryFactory from '../../../server/testutils/factories/caseDetailsSummaryFactory'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import offenderFullFactory from '../../../server/testutils/factories/offenderFullFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import DeleteTravelTimePage from '../../pages/appointments/deleteTravelTimePage'
import Page from '../../pages/page'
import Utils from '../../utils'

context('Delete travel time page', () => {
  const offender = offenderFullFactory.build()
  const appointment = appointmentFactory.build({ offender })
  let providers: Array<ProviderSummaryDto>
  let contactOutcome: ContactOutcomeDto
  let project: ProjectDto

  appointment.adjustments = [adjustmentFactory.build({ reasonCode: 'TTX', amount: 'PT-1H' })]

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubFindAppointment', { appointment })

    Utils.stubOffenderFromAppointment(appointment)

    providers = providerSummaryFactory.buildList(2)
    cy.task('stubGetProviders', { providers: { providers } })
    contactOutcome = contactOutcomeFactory.build({ code: appointment.contactOutcomeCode })
    const contactOutcomes = [contactOutcome, contactOutcomeFactory.build()]
    cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes } })
    project = projectFactory.build({ projectCode: appointment.projectCode })
    cy.task('stubFindProject', { project })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender: appointment.offender })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
  })

  // Scenario: viewing the 'Delete travel time' page
  it('shows the delete travel time page', () => {
    // When I visit the 'Delete travel time' page
    DeleteTravelTimePage.visit(appointment)
    const page = Page.verifyOnPage(DeleteTravelTimePage, appointment)

    // Then I see the travel time details
    page.shouldShowTravelTimeDetails('1 hour')

    // And I see the appointment details
    page.shouldShowAppointmentDetails(project)
  })

  // Scenario: deleting a travel time adjustment
  it('allows a travel time adjustment to be deleted', () => {
    cy.task('stubDeleteAdjustment')

    // When I visit the 'Delete travel time' page
    DeleteTravelTimePage.visit(appointment)
    const page = Page.verifyOnPage(DeleteTravelTimePage, appointment)

    cy.task('stubSaveAppointmentForm')

    // And I submit the form
    page.clickSubmit()

    // Then I see the appointment details page
    const appointmentPage = Page.verifyOnPage(CheckAppointmentDetailsPage, appointment)

    // With a success banner
    appointmentPage.shouldShowSuccessMessage('Travel time has been deleted.')
  })

  // Scenario: navigating back to appointment details page via 'Cancel'
  it('navigates back to the appointment details page', () => {
    cy.task('stubDeleteAdjustment')

    // When I visit the 'Delete travel time' page
    DeleteTravelTimePage.visit(appointment)
    const page = Page.verifyOnPage(DeleteTravelTimePage, appointment)

    cy.task('stubSaveAppointmentForm')

    // And I click cancel
    page.clickCancel()

    // Then I see the appointment details page
    Page.verifyOnPage(CheckAppointmentDetailsPage, appointment)
  })

  // Scenario: handling a 400 error on deleting an adjustment
  it('handles a 400 error on the API', () => {
    cy.task('stubDeleteAdjustmentWithError', { userMessage: '400 error' })

    // When I visit the 'Delete travel time' page
    DeleteTravelTimePage.visit(appointment)
    const page = Page.verifyOnPage(DeleteTravelTimePage, appointment)

    // And I submit the form
    page.clickSubmit()

    // I see an appropriate error message
    page.shouldShowErrorSummary('400 error')
  })
})
