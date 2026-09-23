//  Feature: Add region details for an ETE activity appointment
//    As a case administrator
//    I want to add region details when recording an ETE activity appointment
//    So that I can continue recording the appointment

// Scenario: Validating the choose region page
//    Given I am on the choose region page for an ETE activity
//    And I do not select a region
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the choose region page for an ETE activity
//    And I select a region
//    When I submit the form
//    Then I see the choose project page

// Scenario: can navigate back to the previous page
//    Given I am on the choose region page for an ETE activity
//    When I click back
//    Then I see the choose appointment type page

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import RegionPage from '../../../pages/appointments/otherEte/regionPage'
import ProjectPage from '../../../pages/appointments/otherEte/projectPage'
import ChooseAppointmentTypePage from '../../../pages/appointments/chooseAppointmentTypePage'
import Page from '../../../pages/page'

context('Other ETE activity - Choose region', () => {
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
      provider: undefined,
      projectTeam: undefined,
      project: undefined,
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
    // Given I am on the choose region page for an ETE activity
    const page = RegionPage.visit(this.offender)

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

    // Given I am on the choose region page for an ETE activity
    const page = RegionPage.visit(this.offender)

    // And I select a region
    page.regionInput.select(this.providers[0].code)

    const updatedForm = createAppointmentFormFactory.build({
      crn: this.offender.crn,
      deliusEventNumber,
      projectTypeGroup: 'OTHER_ETE',
      provider: this.providers[0],
      projectTeam: undefined,
      project: undefined,
    })
    cy.task('stubGetAppointmentForm', updatedForm)

    // When I submit the form
    page.clickSubmit()

    // Then I see the choose project page
    Page.verifyOnPage(ProjectPage, this.offender)
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on the choose region page for an ETE activity
    const page = RegionPage.visit(this.offender)

    // When I click back
    page.clickBack()

    // Then I see the choose appointment type page
    Page.verifyOnPage(ChooseAppointmentTypePage, this.offender)
  })
})
