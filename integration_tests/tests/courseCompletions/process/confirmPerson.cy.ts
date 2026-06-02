//  Feature: Confirm a person to process a course completion for
//    As a case admin
//    I want to check the person I entered a crn for
//    So that I can process the completion for the right person

//  Scenario: Viewing person details
//    Given I am on the form page
//    Then I should see the person details
//
//  Scenario: Changing the CRN
//    Given I am on the form page
//    And I click "Enter another CRN"
//    Then I should see the CRN page

//  Scenario: Navigates back to search results
//    Given I am on the page
//    When I click back
//    Then I should see the course completion details page
//    And I click back again
//    Then I should see the course completion details page
//    And I click back again
//    Then I should see the course completion search page

//  Scenario: Navigating to unable to credit time page
//    Given I am on the form page
//    When I click the unable to credit time link
//    Then I should see the unable to credit time page

//  Scenario: Navigating back with recommended CRN
//    Given I am on the page
//    When I click back
//    Then I should see the course completion details page

//  Scenario: Navigating back with recommended CRN which has been changed by user
//    Given I am on the page
//    When I click back
//    Then I should see the CRN page

import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import {
  communityCampusPduFactory,
  communityCampusPdusFactory,
} from '../../../../server/testutils/factories/communityCampusPduFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import pagedModelCourseCompletionEventFactory from '../../../../server/testutils/factories/pagedModelCourseCompletionEventFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import CourseCompletionPage from '../../../pages/courseCompletions/courseCompletionPage'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import SearchCourseCompletionsPage from '../../../pages/courseCompletions/searchCourseCompletionsPage'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'
import Page from '../../../pages/page'
import courseCompletionRecommendationFactory from '../../../../server/testutils/factories/courseCompletionRecommendationFactory'

context('Person Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const offender = offenderFullFactory.build()
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })
  const form = courseCompletionFormFactory.build({ crn: offender.crn })
  const recommendedSelection = courseCompletionRecommendationFactory.build({ crn: null })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetRecommendedSelection', { id: courseCompletion.id, recommendedSelection })
  })

  // Scenario: Viewing person details
  it('displays the community campus and nDelius records', () => {
    //  Given I am on the form page
    const page = PersonPage.visit(courseCompletion, offender)

    // Then I should see the person details
    page.courseCompletionRecord.shouldShowLearnerDetails()
    page.deliusRecord.shouldShowOffenderDetails()
  })

  // Scenario: Changing the CRN
  it('navigates back to the CRN page', () => {
    //  Given I am on the form page
    const page = PersonPage.visit(courseCompletion, offender)

    // And I click "Enter another CRN"
    page.clickEnterAnotherCrn()

    // Then I should see the CRN page
    Page.verifyOnPage(CrnPage)
  })

  // Scenario: Navigates back to search results
  it('navigates back to search results', () => {
    const pdu = communityCampusPduFactory.build({ id: form.originalSearch.pdu })
    const provider = providerSummaryFactory.build({ code: form.originalSearch.provider })
    cy.task('stubFindCourseCompletion', { courseCompletion })
    //  Given I am on the page
    const page = PersonPage.visit(courseCompletion, offender)

    //  When I click back
    cy.task('stubSaveCourseCompletionForm', form)
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CrnPage, courseCompletion)

    //  And I click back again
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)

    // And I click back again
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

  // Scenario: Navigating to unable to credit time page
  it('navigates to unable to credit time page', () => {
    //  Given I am on the form page
    const page = PersonPage.visit(courseCompletion, offender)

    // When I click the unable to credit time link
    page.clickUnableToCreditTimeLink()

    // Then I should see the unable to credit time page
    Page.verifyOnPage(UnableToCreditTimePage, courseCompletion)
  })

  // Scenario: Navigating back with recommended CRN
  it('navigates back to course completion details if recommended CRN is unchanged', () => {
    const recommendation = courseCompletionRecommendationFactory.build({ crn: form.crn })
    cy.task('stubGetRecommendedSelection', { id: courseCompletion.id, recommendedSelection: recommendation })
    cy.task('stubSaveCourseCompletionForm', form)

    //  Given I am on the page
    const page = PersonPage.visit(courseCompletion, offender)

    //  When I click back
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)
  })

  // Scenario: Navigating back with recommended CRN which has been changed by user
  it('navigates back to the CRN page if the recommended CRN has been changed by the user', () => {
    const recommendation = courseCompletionRecommendationFactory.build()
    cy.task('stubGetRecommendedSelection', { id: courseCompletion.id, recommendedSelection: recommendation })
    cy.task('stubSaveCourseCompletionForm', form)

    //  Given I am on the page
    const page = PersonPage.visit(courseCompletion, offender)

    //  When I click back
    page.clickBack()

    // Then I should see the CRN page
    Page.verifyOnPage(CrnPage, courseCompletion)
  })
})
