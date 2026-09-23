//  Feature: Record the outcome of an ETE activity appointment
//    As a case administrator
//    I want to record the outcome of an ETE activity appointment
//    So that I can continue recording the appointment

// Scenario: Validating the record outcome page
//    Given I am on the record outcome page for an ETE activity
//    And I do not complete any fields
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the record outcome page for an ETE activity
//    And I complete the form
//    When I submit the form
//    Then I see the log compliance page

// Scenario: can navigate back to the previous page
//    Given I am on the record outcome page for an ETE activity
//    When I click back
//    Then I see the choose project page

import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import recordActivityFormFactory from '../../../../server/testutils/factories/recordActivityFormFactory'
import projectOutcomeSummaryFactory from '../../../../server/testutils/factories/projectOutcomeSummaryFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import OutcomePage from '../../../pages/appointments/otherEte/outcomePage'
import CompliancePage from '../../../pages/appointments/otherEte/compliancePage'
import ProjectPage from '../../../pages/appointments/otherEte/projectPage'
import Page from '../../../pages/page'

context('Other ETE activity - Record outcome', () => {
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
      date: undefined,
      contactOutcome: undefined,
      startTime: undefined,
      endTime: undefined,
    })
    cy.wrap(form).as('form')

    const contactOutcome = contactOutcomeFactory.build({ attended: true })
    cy.wrap(contactOutcome).as('contactOutcome')

    const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [contactOutcome] })

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetRecordActivityForm', form)
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    cy.task('stubGetTeams', { teams: { providers: [form.projectTeam] }, providerCode: form.provider.code })
    cy.task('stubGetProjects', {
      projects: {
        content: [
          projectOutcomeSummaryFactory.build({ projectCode: form.project.code, projectName: form.project.name }),
        ],
      },
      teamCode: form.projectTeam.code,
      providerCode: form.provider.code,
    })
  })

  // Scenario: Validating the record outcome page
  it('shows validation messages', function test() {
    // Given I am on the record outcome page for an ETE activity
    const page = OutcomePage.visit(this.offender)

    // And I do not complete any fields
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowDateError()
    page.shouldShowStartTimeError()
    page.shouldShowEndTimeError()
    page.shouldShowAttendanceOutcomeError()
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    cy.task('stubSaveRecordActivityForm')

    // Given I am on the record outcome page for an ETE activity
    const page = OutcomePage.visit(this.offender)

    const updatedForm = recordActivityFormFactory.build({
      crn: this.offender.crn,
      deliusEventNumber,
      date: '2026-01-20',
      contactOutcome: this.contactOutcome,
    })
    cy.task('stubGetRecordActivityForm', updatedForm)

    // And I complete the form
    page.completeForm(this.contactOutcome.code)

    // When I submit the form
    page.clickSubmit()

    // Then I see the log compliance page
    Page.verifyOnPage(CompliancePage, this.offender)
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on the record outcome page for an ETE activity
    const page = OutcomePage.visit(this.offender)

    // When I click back
    page.clickBack()

    // Then I see the choose project page
    Page.verifyOnPage(ProjectPage, this.offender)
  })
})
