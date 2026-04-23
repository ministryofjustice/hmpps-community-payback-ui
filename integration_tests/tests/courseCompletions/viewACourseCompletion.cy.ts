//  Feature: View an course completion
//    As a case admin
//    I want to view a course completion
//  Scenario: Processing a course completion
//    Given I am on the course completion page
//    When I click process
//    Then I should see the first page of the form

import {
  communityCampusPduFactory,
  communityCampusPdusFactory,
} from '../../../server/testutils/factories/communityCampusPduFactory'
import courseCompletionFactory from '../../../server/testutils/factories/courseCompletionFactory'
import pagedModelCourseCompletionEventFactory from '../../../server/testutils/factories/pagedModelCourseCompletionEventFactory'
import providerSummaryFactory from '../../../server/testutils/factories/providerSummaryFactory'
import CourseCompletionPage from '../../pages/courseCompletions/courseCompletionPage'
import CrnPage from '../../pages/courseCompletions/process/crnPage'
import SearchCourseCompletionsPage from '../../pages/courseCompletions/searchCourseCompletionsPage'
import Page from '../../pages/page'

context('Project page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  // Scenario: Processing a course completion
  it('enables processing a course completion', () => {
    const courseCompletion = courseCompletionFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })

    //  Given I am on the course completion page
    const page = CourseCompletionPage.visit(courseCompletion)
    page.shouldShowCourseCompletionDetails()

    //  When I click process
    page.clickProcess()

    // Then I should see the first page of the form
    Page.verifyOnPage(CrnPage)
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    const courseCompletion = courseCompletionFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })
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
  it('navigates back', () => {
    const pdu = communityCampusPduFactory.build()
    const provider = providerSummaryFactory.build()
    const courseCompletion = courseCompletionFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    //  Given I am on the page
    const page = CourseCompletionPage.visit(courseCompletion, { pdu: pdu.id, provider: provider.code })

    //  When I click back
    cy.task('stubGetCommunityCampusPdus', { pdus: communityCampusPdusFactory.build() })
    cy.task('stubGetProviders', {
      providers: { providers: providerSummaryFactory.buildList(2) },
    })
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: [courseCompletion],
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
