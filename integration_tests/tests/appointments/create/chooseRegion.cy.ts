//  Feature: Add region details for a new appointment
//    As a case administrator
//    I want to add region details when creating a new appointment
//    So that I can start recording the appointment outcome

// Scenario: Validating the choose region page
//    Given I am on a 'choose region' page for a new appointment
//    And I do not select a region
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on a 'choose region' page for a new appointment
//    And I select a region
//    When I submit the form
//    Then I see the choose supervisor page

// Scenario: can navigate back to the previous page
//    Given I am on a 'choose region' page for a new appointment
//    When I click back
//    Then I see the date page

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import ChooseRegionPage from '../../../pages/appointments/chooseRegionPage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import DatePage from '../../../pages/appointments/datePage'
import Page from '../../../pages/page'

context('Create appointment - Choose region', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({
      crn: offender.crn,
      provider: undefined,
      originalParams: { crn: '1', deliusEventNumber: '1' },
    })
    cy.wrap(form).as('form')

    const providers = providerSummaryFactory.buildList(2)
    cy.wrap(providers).as('providers')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
    cy.task('stubGetProviders', { providers: { providers } })
  })

  // Scenario: Validating the choose region page
  it('shows validation messages', function test() {
    // Given I am on a 'choose region' page for a new appointment
    const page = ChooseRegionPage.visitForCreateAppointment(this.offender)

    // And I do not select a region
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('provider', 'Choose a region')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    const teams = providerTeamSummaryFactory.buildList(2)
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.providers[0].code })
    cy.task('stubSaveAppointmentForm')

    // Given I am on a 'choose region' page for a new appointment
    const page = ChooseRegionPage.visitForCreateAppointment(this.offender)

    // And I select a region
    page.regionInput.select(this.providers[0].code)

    const form = createAppointmentFormFactory.build({
      crn: this.offender.crn,
      provider: this.providers[0],
      originalParams: { crn: '1', deliusEventNumber: '1' },
    })
    cy.task('stubGetAppointmentForm', form)

    // When I submit the form
    page.clickSubmit()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, { offender: this.offender })
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on a 'choose region' page for a new appointment
    const page = ChooseRegionPage.visitForCreateAppointment(this.offender)

    // When I click back
    page.clickBack()

    // Then I see the date page
    Page.verifyOnPage(DatePage, { offender: this.offender })
  })
})
