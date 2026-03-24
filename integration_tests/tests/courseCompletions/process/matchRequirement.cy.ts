//  Feature: Confirm the requirement to process a course completion against
//    As a case admin
//    I want to select the requirement
//    So that I can process the course completion for the right requirement

//  Scenario: Selecting requirement
//    Given I am on the form page
//    When I select a requirement and click continue
//    Then I should see the next page

//  Scenario: Displaying a previously selected requirement
//    Given I have previously selected a requirement
//    And I visit the requirement page
//    Then I should see the previously selected requirement is checked

//  Scenario: Displays validation error
//    Given I am on the form page
//    When I click continue
//    Then I see errors

import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import unpaidWorkDetailsFactory from '../../../../server/testutils/factories/unpaidWorkDetailsFactory'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import Page from '../../../pages/page'

context('Requirement Page', () => {
  const courseCompletion = courseCompletionFactory.build({ region: 'code' })
  const teams = providerTeamSummaryFactory.buildList(2)
  const [team] = teams
  const projects = pagedModelProjectOutcomeSummaryFactory.build()
  const { providerCode } = courseCompletion.pdu
  const form = courseCompletionFormFactory.build({ team: undefined, project: undefined })
  const upwDetails = unpaidWorkDetailsFactory.build()
  const offender = offenderFullFactory.build({ crn: form.crn })
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender, unpaidWorkDetails: [upwDetails] })

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
    page.selectRequirement(upwDetails.eventNumber)
    page.clickSubmit()

    // Then I see the next page
    Page.verifyOnPage(ProjectPage)
  })

  // Scenario: Displaying a previously selected requirement
  it('displays any previously selected requirement option as checked', () => {
    //  Given I have previously selected a requirement
    const formWithEventNumber = courseCompletionFormFactory.build({ deliusEventNumber: upwDetails.eventNumber })
    const offenderForFormWithEventNumber = offenderFullFactory.build({ crn: formWithEventNumber.crn })
    const caseDetailsSummaryWithEventNumber = caseDetailsSummaryFactory.build({
      offender: offenderForFormWithEventNumber,
      unpaidWorkDetails: [upwDetails],
    })
    cy.task('stubGetCourseCompletionForm', formWithEventNumber)
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary: caseDetailsSummaryWithEventNumber,
    })

    // And I visit the requirement page
    const page = RequirementPage.visit(courseCompletion)

    // Then I should see the previously selected requirement is checked
    page.shouldShowCheckedRequirement(upwDetails.eventNumber)
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
})
