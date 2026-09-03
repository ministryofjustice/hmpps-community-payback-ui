//  Feature: Credit travel time for an appointment
//    As a case administrator
//    I want to credit travel time to an offender
//    So that I can correctly track all time completed for an unpaid work order
//
//  Scenario: Showing the process travel time button
//    Given I am on the appointment details page
//    And the appointment has an outcome set
//    And the appointment has a communityPaybackId reference
//    Then I should see the "Process travel time" button
//    And I should not see the alert banner for processing travel time in Delius
//
//  Scenario: Not showing the process travel time button if no outcome is present
//    Given I am on the appointment details page
//    And the appointment does not have an outcome set
//    And the appointment has a communityPaybackId reference
//    Then I should not see the "Process travel time" button
//    And I should not see the alert banner for processing travel time in Delius
//
//  Scenario: Not showing the process travel time button if communityPaybackId reference is not present
//    Given I am on the appointment details page
//    And the appointment has an outcome set
//    And the appointment does not have a communityPaybackId reference
//    Then I should not see the "Process travel time" button
//    And I should see the alert banner for processing travel time in Delius
//
//  Scenario: Crediting travel time
//    Given I am on the appointment details page
//    And I click "Process travel time"
//    And I complete the form
//    Then I should be taken back to the appointment details page with a success message
//    And I should not see the alert banner for processing travel time in Delius

import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import Page from '../../pages/page'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import { contactOutcomesFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import Utils from '../../utils'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import adjustmentFactory from '../../../server/testutils/factories/adjustmentFactory'

context('Crediting travel time from appointment page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.task('stubFindProject', { project })
    cy.wrap(project).as('project')

    cy.task('stubSaveAppointmentForm')

    const contactOutcomes = contactOutcomesFactory.build()
    cy.task('stubGetContactOutcomes', { contactOutcomes })
  })

  //  Scenario: Showing the process travel time button
  it('shows process travel time button', function test() {
    //  Given I am on the appointment details page
    //  And the appointment has an outcome set
    //  And the appointment has a communityPaybackId reference

    const appointmentWithOutcomeAndReference = appointmentFactory.build({
      projectCode: this.project.projectCode,
      providerCode: this.project.providerCode,
      contactOutcomeCode: 'AAAA',
      communityPaybackId: '1',
    })

    cy.task('stubFindAppointment', { appointment: appointmentWithOutcomeAndReference })

    Utils.stubOffenderFromAppointment(appointmentWithOutcomeAndReference)

    const checkAppointmentDetailsPage = CheckAppointmentDetailsPage.visit(appointmentWithOutcomeAndReference, '')

    //  Then I should see the "Process travel time" button
    checkAppointmentDetailsPage.shouldShowProcessTravelTimeLink()

    // And I should not see the alert banner for processing travel time in Delius
    checkAppointmentDetailsPage.shouldNotShowAlertBannerForProcessingTravelTime()
  })

  //  Scenario: Not showing the process travel time button if no outcome is present
  it('does not show process travel time button if no outcome is present', function test() {
    //  Given I am on the appointment details page
    //  And the appointment does not have an outcome set
    //  And the appointment has a communityPaybackId reference

    const appointmentWithOutcomeAndReference = appointmentFactory.build({
      projectCode: this.project.projectCode,
      providerCode: this.project.providerCode,
      contactOutcomeCode: undefined,
      communityPaybackId: '1',
    })

    cy.task('stubFindAppointment', { appointment: appointmentWithOutcomeAndReference })

    Utils.stubOffenderFromAppointment(appointmentWithOutcomeAndReference)

    const checkAppointmentDetailsPage = CheckAppointmentDetailsPage.visit(appointmentWithOutcomeAndReference, '')

    // Then I should not see the "Process travel time" button
    checkAppointmentDetailsPage.shouldNotShowProcessTravelTimeLink()

    // And I should not see the alert banner for processing travel time in Delius
    checkAppointmentDetailsPage.shouldNotShowAlertBannerForProcessingTravelTime()
  })

  //  Scenario: Not showing the process travel time button if communityPaybackId reference is not present
  it('does not show process travel time button if communityPaybackId reference is not present', function test() {
    //  Given I am on the appointment details page
    //  And the appointment has an outcome set
    //  And the appointment does not have a communityPaybackId reference

    const appointmentWithOutcomeAndReference = appointmentFactory.build({
      projectCode: this.project.projectCode,
      providerCode: this.project.providerCode,
      contactOutcomeCode: 'AAAA',
      communityPaybackId: undefined,
    })

    cy.task('stubFindAppointment', { appointment: appointmentWithOutcomeAndReference })

    Utils.stubOffenderFromAppointment(appointmentWithOutcomeAndReference)

    const checkAppointmentDetailsPage = CheckAppointmentDetailsPage.visit(appointmentWithOutcomeAndReference, '')

    // Then I should not see the "Process travel time" button
    checkAppointmentDetailsPage.shouldNotShowProcessTravelTimeLink()

    // And I should see the alert banner for processing travel time in Delius
    checkAppointmentDetailsPage.shouldShowAlertBannerForProcessingTravelTime()
  })

  //  Scenario: Crediting travel time
  it('processes travel time', function test() {
    //  Given I am on the appointment details page
    const appointmentWithOutcomeAndReference = appointmentFactory.build({
      projectCode: this.project.projectCode,
      providerCode: this.project.providerCode,
      contactOutcomeCode: 'AAAA',
      communityPaybackId: '1',
    })

    cy.task('stubFindAppointment', { appointment: appointmentWithOutcomeAndReference })

    Utils.stubOffenderFromAppointment(appointmentWithOutcomeAndReference)

    const checkAppointmentDetailsPage = CheckAppointmentDetailsPage.visit(appointmentWithOutcomeAndReference, '')

    //  And I click "Process travel time"
    checkAppointmentDetailsPage.clickProcessTravelTime()

    //  And I complete the form
    cy.task('stubGetAdjustmentReasons')
    cy.task('stubSaveAdjustment', { appointment: appointmentWithOutcomeAndReference })

    const updateTravelTimePage = Page.verifyOnPage(UpdateTravelTimePage, appointmentWithOutcomeAndReference)

    updateTravelTimePage.completeForm()

    const travelTimeAdjustment = adjustmentFactory.build({ reasonCode: 'TTX', amount: 'PT-1H' })

    const appointmentWithTravelTime = appointmentFactory.build({
      ...appointmentWithOutcomeAndReference,
      adjustments: [travelTimeAdjustment],
    })

    cy.task('stubFindAppointment', { appointment: appointmentWithTravelTime })
    updateTravelTimePage.clickSubmit()

    //  Then I should be taken back to the appointment details page with a success message
    Page.verifyOnPage(CheckAppointmentDetailsPage, appointmentWithOutcomeAndReference)

    // And I should not see the alert banner for processing travel time in Delius
    checkAppointmentDetailsPage.shouldNotShowAlertBannerForProcessingTravelTime()

    // And I should see project details
    checkAppointmentDetailsPage.shouldContainProjectDetails(appointmentWithOutcomeAndReference, this.project)
  })
})
