//  Feature: Log compliance for an ETE activity appointment
//    As a case administrator
//    I want to log compliance for an ETE activity appointment
//    So that I can continue recording the appointment

// Scenario: Validating the log compliance page
//    Given I am on the log compliance page for an ETE activity
//    And I do not select a work quality or behaviour rating
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the log compliance page for an ETE activity
//    And I complete the form
//    When I submit the form
//    Then I see the confirm details page

// Scenario: can navigate back to the previous page
//    Given I am on the log compliance page for an ETE activity
//    When I click back
//    Then I see the record outcome page

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import recordActivityFormFactory from '../../../../server/testutils/factories/recordActivityFormFactory'
import { contactOutcomeFactory } from '../../../../server/testutils/factories/contactOutcomeFactory'
import CompliancePage from '../../../pages/appointments/otherEte/compliancePage'
import ConfirmPage from '../../../pages/appointments/otherEte/confirmPage'
import OutcomePage from '../../../pages/appointments/otherEte/outcomePage'
import Page from '../../../pages/page'

context('Other ETE activity - Log compliance', () => {
  const deliusEventNumber = '2'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = recordActivityFormFactory.build({
      crn: offender.crn,
      deliusEventNumber,
      attendanceData: undefined,
    })
    cy.wrap(form).as('form')

    const contactOutcomes = [contactOutcomeFactory.build({ attended: true })]

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetRecordActivityForm', form)
    cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes } })
  })

  // Scenario: Validating the log compliance page
  it('shows validation messages', function test() {
    // Given I am on the log compliance page for an ETE activity
    const page = CompliancePage.visit(this.offender)

    // And I do not select a work quality or behaviour rating
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('workQuality', 'Select their work quality')
    page.shouldShowErrorSummary('behaviour', 'Select their behaviour')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    cy.task('stubSaveRecordActivityForm')

    // Given I am on the log compliance page for an ETE activity
    const page = CompliancePage.visit(this.offender)

    const updatedForm = recordActivityFormFactory.build({
      crn: this.offender.crn,
      deliusEventNumber,
      attendanceData: { workQuality: 'GOOD', behaviour: 'UNSATISFACTORY' },
    })
    cy.task('stubGetRecordActivityForm', updatedForm)

    // And I complete the form
    page.completeForm()

    // When I submit the form
    page.clickSubmit()

    // Then I see the confirm details page
    Page.verifyOnPage(ConfirmPage, this.offender)
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on the log compliance page for an ETE activity
    const page = CompliancePage.visit(this.offender)

    // When I click back
    page.clickBack()

    // Then I see the record outcome page
    Page.verifyOnPage(OutcomePage, this.offender)
  })
})
