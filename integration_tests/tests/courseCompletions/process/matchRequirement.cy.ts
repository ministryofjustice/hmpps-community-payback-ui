//  Feature: Confirm the requirement to process a course completion against
//    As a case admin
//    I want to select the requirement
//    So that I can process the course completion for the right requirement

//  Scenario: Selecting requirement
//    Given I am on the form page
//    When I select a requirement and click continue
//    Then I should see the next page

//  Scenario: skipping requirement page if there is only one requirement
//    Given I am on the history page
//    And I click submit
//    Then I should see the match project page

//  Scenario: Displaying a previously selected requirement
//    Given I have previously selected a requirement
//    And I visit the requirement page
//    Then I should see the previously selected requirement is checked

//  Scenario: Displays validation error
//    Given I am on the form page
//    When I click continue
//    Then I see errors

//  Scenario: Navigating to unable to credit time page
//    Given I am on the form page
//    When I click the unable to credit time link
//    Then I should see the unable to credit time page

import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import unpaidWorkDetailsFactory from '../../../../server/testutils/factories/unpaidWorkDetailsFactory'
import HistoryPage from '../../../pages/courseCompletions/process/historyPage'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'
import Page from '../../../pages/page'
import Utils from '../../../utils'

context('Requirement Page', () => {
  const courseCompletion = courseCompletionFactory.build({ region: 'code' })
  const teams = providerTeamSummaryFactory.buildList(2)
  const [team] = teams
  const projects = pagedModelProjectOutcomeSummaryFactory.build()
  const { providerCode } = courseCompletion.pdu
  const form = courseCompletionFormFactory.build({ team: undefined, project: undefined })
  const upwDetails = unpaidWorkDetailsFactory.buildList(3)
  const offender = offenderFullFactory.build({ crn: form.crn })
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender, unpaidWorkDetails: upwDetails })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubSaveCourseCompletionForm')
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })
  })

  // Scenario: Selecting requirement
  it('select a requirement', () => {
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })

    //  Given I am on the form page
    const page = RequirementPage.visit(courseCompletion)

    // When I select a requirement
    page.selectRequirement(upwDetails[0].eventNumber)
    page.clickSubmit()

    // Then I see the next page
    Page.verifyOnPage(ProjectPage)
  })

  // Scenario: skipping requirement page if there is only one requirement
  it('skips requirement page if there is only one requirement', () => {
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })

    const appointments = appointmentSummaryFactory.buildList(3)

    cy.task('stubGetAppointments', {
      request: Utils.getEteAppointmentRequest(form.crn),
      pagedAppointments: { content: appointments },
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary: caseDetailsSummaryFactory.build({
        offender,
        unpaidWorkDetails: [upwDetails[0]],
      }),
    })

    // Given I am on the history page
    const page = HistoryPage.visit(courseCompletion)

    // And I click submit
    page.clickSubmit()

    // Then I should see the match project page
    Page.verifyOnPage(ProjectPage)
  })

  // Scenario: Displaying a previously selected requirement
  it('displays any previously selected requirement option as checked', () => {
    //  Given I have previously selected a requirement
    const formWithEventNumber = courseCompletionFormFactory.build({ deliusEventNumber: upwDetails[0].eventNumber })
    const offenderForFormWithEventNumber = offenderFullFactory.build({ crn: formWithEventNumber.crn })
    const caseDetailsSummaryWithEventNumber = caseDetailsSummaryFactory.build({
      offender: offenderForFormWithEventNumber,
      unpaidWorkDetails: upwDetails,
    })
    cy.task('stubGetCourseCompletionForm', formWithEventNumber)
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary: caseDetailsSummaryWithEventNumber,
    })

    // And I visit the requirement page
    const page = RequirementPage.visit(courseCompletion)

    // Then I should see the previously selected requirement is checked
    page.shouldShowCheckedRequirement(upwDetails[0].eventNumber)
  })

  describe('validation', () => {
    // Scenario: displays requirement error
    it('displays error for requirement', () => {
      //  Given I am on the form page
      const page = RequirementPage.visit(courseCompletion)

      // When I click continue
      page.clickSubmit()

      // Then I see errors
      Page.verifyOnPage(RequirementPage)
      page.shouldShowErrorSummary('deliusEventNumber', 'Select a requirement')
    })
  })

  // Scenario: Navigating to unable to credit time page
  it('navigates to unable to credit time page', () => {
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })

    // Given I am on the form page
    const page = RequirementPage.visit(courseCompletion)

    // When I click the unable to credit time link
    page.clickUnableToCreditTimeLink()

    // Then I should see the unable to credit time page
    Page.verifyOnPage(UnableToCreditTimePage, courseCompletion)
  })
})
