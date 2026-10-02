//  Feature: Add project details for an ETE activity appointment
//    As a case administrator
//    I want to add project details when recording an ETE activity appointment
//    So that I can continue recording the appointment

// Scenario: Validating the choose project page
//    Given I am on the choose project page for an ETE activity
//    And I do not select a team or project
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the choose project page for an ETE activity
//    And I complete the form
//    When I submit the form
//    Then I see the record outcome page

// Scenario: navigates back to the region page given it is set in the form options
//    Given I am on the choose project page for an ETE activity
//    When I click back
//    Then I see the choose region page

// Scenario: navigates out of the form when the region question is not to be shown
//    Given I am on the choose project page for an ETE activity
//    When I click back
//    Then I see the choose appointment type page

import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import projectOutcomeSummaryFactory from '../../../../server/testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import ProjectPage from '../../../pages/appointments/otherEte/projectPage'
import OutcomePage from '../../../pages/appointments/otherEte/outcomePage'
import RegionPage from '../../../pages/appointments/otherEte/regionPage'
import Page from '../../../pages/page'
import ChooseAppointmentTypePage from '../../../pages/appointments/chooseAppointmentTypePage'

context('Other ETE activity - Choose project', () => {
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
      project: undefined,
      options: {
        showRegionQuestion: true,
      },
    })
    cy.wrap(form).as('form')

    const team = providerTeamSummaryFactory.build({ code: form.projectTeam.code })
    cy.wrap(team).as('team')

    const selectedProject = projectOutcomeSummaryFactory.build()
    cy.wrap(selectedProject).as('selectedProject')

    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: form.provider.code })
    cy.task('stubGetProjects', {
      projects: { content: [selectedProject] },
      teamCode: form.projectTeam.code,
      providerCode: form.provider.code,
    })
    cy.task('stubGetProviders', { providers: { providers: [form.provider, providerSummaryFactory.build()] } })

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
  })

  // Scenario: Validating the choose project page
  it('shows validation messages', function test() {
    // Given I am on the choose project page for an ETE activity
    const page = ProjectPage.visit(this.offender)

    // And I do not select a team or project
    page.form.clearTeam()

    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.form.shouldShowTeamError()
    page.form.teamInput.shouldHaveValue('')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    const contactOutcomes = contactOutcomesFactory.build({
      contactOutcomes: [contactOutcomeFactory.build({ attended: true })],
    })
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    cy.task('stubSaveAppointmentForm')

    // Given I am on the choose project page for an ETE activity
    const page = ProjectPage.visit(this.offender)

    const updatedForm = createAppointmentFormFactory.build({
      crn: this.offender.crn,
      deliusEventNumber,
      projectTypeGroup: 'OTHER_ETE',
      provider: this.form.provider,
      projectTeam: this.team,
      project: { code: this.selectedProject.projectCode, name: this.selectedProject.projectName },
    })
    cy.task('stubGetAppointmentForm', updatedForm)

    // And I complete the form
    page.form.selectTeam(this.team)
    page.form.selectProject(this.selectedProject)

    // When I submit the form
    page.clickSubmit()

    // Then I see the record outcome page
    Page.verifyOnPage(OutcomePage, this.offender)
  })

  describe('navigating back', () => {
    // Scenario: navigates back to the region page given it is set in the form options
    it('navigates back to region page if the region question is set to be shown', function test() {
      // Given I am on the choose project page for an ETE activity
      const page = ProjectPage.visit(this.offender)

      // When I click back
      page.clickBack()

      // Then I see the choose region page
      Page.verifyOnPage(RegionPage, this.offender)
    })

    // Scenario: navigates out of the given that region question is not to be shown
    it('navigates back out of form if the region question is not to be shown', function test() {
      const form = createAppointmentFormFactory.build({
        ...this.form,
        options: {
          showRegionQuestion: false,
        },
      })
      cy.task('stubGetAppointmentForm', form)

      // Given I am on the choose project page for an ETE activity
      const page = ProjectPage.visit(this.offender)

      // When I click back
      page.clickBack()

      // Then I see the choose appointment type page
      Page.verifyOnPage(ChooseAppointmentTypePage, this.offender)
    })
  })
})
