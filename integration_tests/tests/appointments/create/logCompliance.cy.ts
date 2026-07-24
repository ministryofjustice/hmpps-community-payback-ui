//  Feature: Log compliance for a new appointment
//    As a case administrator
//    I want to log compliance when creating a new appointment
//    So that I can track progress for an unpaid work order

// Scenario: Validating the log compliance page
//    Given I am on the log compliance page for a new appointment
//    And I do not complete required fields
//    When I submit the form
//    Then I see the log compliance page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the log compliance page for a new appointment
//    And I complete the form
//    When I submit the form
//    Then I see the confirm details page

// Scenario: can navigate back to the previous page
//    Given I am on the log compliance page for a new appointment
//    When I click back
//    Then I see the log hours page

import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import { contactOutcomeFactory } from '../../../../server/testutils/factories/contactOutcomeFactory'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'
import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'

context('Create appointment - Log compliance', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({
      crn: offender.crn,
      contactOutcome: contactOutcomeFactory.build({ enforceable: false }),
    })
    cy.wrap(form).as('form')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
  })

  // Scenario: Validating the log compliance page
  it('shows validation messages', function test() {
    // Given I am on the log compliance page for a new appointment
    const page = LogCompliancePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I do not complete required fields
    // When I submit the form
    page.clickSubmit()

    // Then I see the log compliance page with errors
    page.shouldShowErrorSummary('workQuality', 'Select their work quality')
    page.shouldShowErrorSummary('behaviour', 'Select their behaviour')
    page.shouldNotHaveAnySelectedValues()
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    cy.task('stubSaveAppointmentForm')

    // Given I am on the log compliance page for a new appointment
    const page = LogCompliancePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I complete the form
    page.completeForm()

    // When I submit the form
    page.clickSubmit()

    // Then I see the confirm details page
    const confirmPage = Page.verifyOnPage(ConfirmDetailsPage, { offender: this.offender })
    confirmPage.shouldShowFormTitle()
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on the log compliance page for a new appointment
    const page = LogCompliancePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // When I click back
    page.clickBack()

    // Then I see the log hours page
    Page.verifyOnPage(LogHoursPage, { offender: this.offender })
  })
})
