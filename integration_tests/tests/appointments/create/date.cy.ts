//  Feature: Add a date for a new appointment
//    As a case administrator
//    I want to add a date when creating a new appointment
//    So that I can record when the appointment takes place

// Scenario: Validating the 'date' page
//    Given I am on the 'date' page for a new appointment
//    And I clear the date field
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the 'date' page for a new appointment
//    And I enter a valid date
//    When I submit the form
//    Then I see the choose supervisor page

import DatePage from '../../../pages/appointments/datePage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import Page from '../../../pages/page'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'

context('Create appointment - Date', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({ crn: offender.crn })
    cy.wrap(form).as('form')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
  })

  // Scenario: Validating the 'date' page
  it('shows validation messages', function test() {
    // Given I am on the 'date' page for a new appointment
    const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I clear the date field
    page.clearDate()

    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('date', 'Enter or select a date')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    // Given I am on the 'date' page for a new appointment
    const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I enter a valid date
    page.enterDate('18/9/2025')

    const teams = providerTeamSummaryFactory.buildList(2)
    cy.task('stubFindProject', { project: this.project })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })
    cy.task('stubSaveAppointmentForm')

    // When I submit the form
    page.clickSubmit()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, { offender: this.offender })
  })
})
