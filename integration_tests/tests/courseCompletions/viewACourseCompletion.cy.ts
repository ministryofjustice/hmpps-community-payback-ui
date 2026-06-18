//  Feature: View an course completion
//    As a case admin
//    I want to view a course completion
//  Scenario: Processing a course completion
//    Given I am on the course completion page
//    When I click process
//    Then I should see the first page of the form
//  Scenario: Showing completion details for pass on third attempt
//    Given the course completion is a pass on the third attempt
//    When I visit the course completion page
//    Then I should see data for three attempts
//  Scenario: Showing completion details for pass on second attempt
//    Given the course completion is a pass on the second attempt
//    When I visit the course completion page
//    Then I should see data for two attempts
//  Scenario: Showing completion details for fail on third attempt
//    Given the course completion is a fail on the third attempt
//    When I visit the course completion page
//    Then I should see data for three attempts
//  Scenario: Skips CRN page if recommendation
//    Given I am on the course completion page
//    When I click process
//    Then I should see the confirm person page

import caseDetailsSummaryFactory from '../../../server/testutils/factories/caseDetailsSummaryFactory'
import {
  communityCampusPduFactory,
  communityCampusPdusFactory,
} from '../../../server/testutils/factories/communityCampusPduFactory'
import courseCompletionFactory from '../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../server/testutils/factories/courseCompletionFormFactory'
import courseCompletionRecommendationFactory from '../../../server/testutils/factories/courseCompletionRecommendationFactory'
import offenderFullFactory from '../../../server/testutils/factories/offenderFullFactory'
import pagedModelCourseCompletionEventFactory from '../../../server/testutils/factories/pagedModelCourseCompletionEventFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import CourseCompletionPage from '../../pages/courseCompletions/courseCompletionPage'
import CrnPage from '../../pages/courseCompletions/process/crnPage'
import PersonPage from '../../pages/courseCompletions/process/personPage'
import SearchCourseCompletionsPage from '../../pages/courseCompletions/searchCourseCompletionsPage'
import Page from '../../pages/page'

context('Project page', () => {
  const form = courseCompletionFormFactory.build()
  const recommendedSelection = courseCompletionRecommendationFactory.build({ crn: null })
  const courseCompletion = courseCompletionFactory.build()
  const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
    content: [courseCompletion],
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubSaveCourseCompletionForm', form)
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetRecommendedSelection', { id: courseCompletion.id, recommendedSelection })
    cy.task('stubGetCourseCompletionHistory', {
      id: courseCompletion.id,
      courseCompletions: [courseCompletion],
    })
  })

  // Scenario: Processing a course completion
  it('enables processing a course completion', () => {
    //  Given I am on the course completion page
    const page = CourseCompletionPage.visit(courseCompletion)
    page.shouldShowCourseCompletionDetails()

    //  When I click process
    page.clickProcess()

    // Then I should see the first page of the form
    Page.verifyOnPage(CrnPage)
  })

  it('shows completion details for a pass on third attempt', () => {
    // Given the course completion is a pass on the third attempt
    const courseCompletionPass = courseCompletionFactory.build({ status: 'Passed', attempts: 3 })

    cy.task('stubFindCourseCompletion', { courseCompletion: courseCompletionPass })
    cy.task('stubGetRecommendedSelection', { id: courseCompletionPass.id, recommendedSelection })
    cy.task('stubGetCourseCompletionHistory', {
      id: courseCompletionPass.id,
      courseCompletions: [courseCompletionPass],
    })

    // When I visit the course completion page
    const page = CourseCompletionPage.visit(courseCompletionPass)

    // Then I should see data for three attempts
    page.completionDetails.shouldShowCompletionDetails(courseCompletionPass)
    page.completionDetails.shouldShowAttemptPlaceholder({ attempt: 2 })
    page.completionDetails.shouldShowAttemptPlaceholder({ attempt: 1 })
  })

  it('shows completion details for a pass on second attempt', () => {
    // Given the course completion is a pass on the second attempt
    const courseCompletionPass = courseCompletionFactory.build({ status: 'Passed', attempts: 2 })

    cy.task('stubFindCourseCompletion', { courseCompletion: courseCompletionPass })
    cy.task('stubGetRecommendedSelection', { id: courseCompletionPass.id, recommendedSelection })
    cy.task('stubGetCourseCompletionHistory', {
      id: courseCompletionPass.id,
      courseCompletions: [courseCompletionPass],
    })

    // When I visit the course completion page
    const page = CourseCompletionPage.visit(courseCompletionPass)

    // Then I should see data for two attempts
    page.completionDetails.shouldShowCompletionDetails(courseCompletionPass)
    page.completionDetails.shouldShowAttemptPlaceholder({ attempt: 1 })
  })

  it('shows completion details for a fail', () => {
    // Given the course completion is a fail on the third attempt
    const courseCompletionFail = courseCompletionFactory.build({ status: 'Failed', attempts: 3 })

    cy.task('stubFindCourseCompletion', { courseCompletion: courseCompletionFail })
    cy.task('stubGetRecommendedSelection', { id: courseCompletionFail.id, recommendedSelection })
    cy.task('stubGetCourseCompletionHistory', {
      id: courseCompletionFail.id,
      courseCompletions: [courseCompletionFail],
    })

    // When I visit the course completion page
    const page = CourseCompletionPage.visit(courseCompletionFail)

    // Then I should see data for three attempts
    page.completionDetails.shouldShowCompletionDetails(courseCompletionFail)
    page.completionDetails.shouldShowAttemptPlaceholder({ attempt: 2 })
    page.completionDetails.shouldShowAttemptPlaceholder({ attempt: 1 })
  })

  // Scenario: Skips CRN page if recommendation
  it('skips the CRN page when a recommendation is available', () => {
    const recommendation = courseCompletionRecommendationFactory.build()
    cy.task('stubGetRecommendedSelection', { id: courseCompletion.id, recommendedSelection: recommendation })

    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender: offenderFullFactory.build({ crn: form.crn }),
    })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })

    //  Given I am on the course completion page
    const page = CourseCompletionPage.visit(courseCompletion)
    page.shouldShowCourseCompletionDetails()

    //  When I click process
    page.clickProcess()

    // Then I should see the confirm person page
    Page.verifyOnPage(PersonPage)
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    //  Given I am on the page
    const page = CourseCompletionPage.visit(courseCompletion)

    //  When I click back
    cy.task('stubGetCommunityCampusPdus', { pdus: communityCampusPdusFactory.build() })
    cy.task('stubGetProviders', {
      providers: { providers: providerSummaryFactory.buildList(2) },
    })
    page.clickBack()

    // Then I should see the course completion search page
    Page.verifyOnPage(SearchCourseCompletionsPage, courseCompletion)
  })

  // Scenario: Navigating back with search params
  it('navigates back to search results', () => {
    const pdu = communityCampusPduFactory.build()
    const provider = providerSummaryFactory.build()
    //  Given I am on the page
    const page = CourseCompletionPage.visit(courseCompletion, { pdu: pdu.id, provider: provider.code })

    //  When I click back
    cy.task('stubGetCommunityCampusPdus', { pdus: communityCampusPdusFactory.build() })
    cy.task('stubGetProviders', {
      providers: { providers: providerSummaryFactory.buildList(2) },
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: provider.code,
        pduId: pdu.id,
        username: 'some-name',
      },
      courseCompletions: courseCompletionResponse,
    })
    page.clickBack()

    // Then I should see the course completion search page
    const searchPage = Page.verifyOnPage(SearchCourseCompletionsPage, courseCompletion)
    searchPage.shouldShowSearchResults(courseCompletion)
  })
})
