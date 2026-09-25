//  Feature: Find a person to process a course completion for
//    As a case admin
//    I want to enter a crn for a person
//    So that I can process the completion for the right person

//  Scenario: Submitting the form
//    Given I am on the form page
//    When I complete the form
//    Then I should see the next page of the form

//  Scenario: Submitting the form when the offender is restricted
//    Given I am on the form page
//    When I complete the form
//    And the offender is limited
//    Then I see the restricted person page

//  Scenario: Submitting the form when the offender has no requirement
//    Given I am on the form page
//    When I complete the form
//    And the offender has no requirement
//    Then I see the no requirement page

//  Scenario: Navigating back
//    Given I am on the form page
//    When I click back
//    Then I should see the course completion details page

//  Scenario: Navigates back to search results
//    Given I am on the page
//    When I click back
//    Then I should see the course completion details page
//    And I click back again
//    Then I should see the course completion search page with results

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
import Page from '../../../pages/page'
import courseCompletionRecommendationFactory from '../../../../server/testutils/factories/courseCompletionRecommendationFactory'
import probationSearchResponseFactory from '../../../../server/testutils/factories/probationSearchResponseFactory'
import probationSearchResultFactory from '../../../../server/testutils/factories/probationSearchResultFactory'
import offenderLimitedFactory from '../../../../server/testutils/factories/offenderLimitedFactory'
import RestrictedPerson from '../../../pages/restrictedPersonPage'
import NoRequirementsPage from '../../../pages/noRequirementsPage'
import Offender from '../../../../server/models/offender'

context('Crn Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const offender = offenderFullFactory.build()
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })
  const form = courseCompletionFormFactory.build({ crn: undefined })
  const recommendedSelection = courseCompletionRecommendationFactory.build({ crn: null })

  const limitedOffender = offenderLimitedFactory.build()
  const offenderWithNoRequirements = offenderFullFactory.build()

  const probationSearchResultOne = probationSearchResultFactory.build({ otherIds: { crn: offender.crn } })
  const probationSearchResultTwo = probationSearchResultFactory.build({ otherIds: { crn: limitedOffender.crn } })
  const probationSearchResultThree = probationSearchResultFactory.build({
    otherIds: { crn: offenderWithNoRequirements.crn },
  })

  const probationSearchResponse = probationSearchResponseFactory.build({
    content: [probationSearchResultOne, probationSearchResultTwo, probationSearchResultThree],
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetRecommendedSelection', { id: courseCompletion.id, recommendedSelection })

    cy.task('stubSearchPerson', probationSearchResponse)
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion, '12')

    //  When I complete the form
    page.personSearchComponent.enterSearchTerm(offender.crn)

    cy.task('stubSaveCourseCompletionForm', { ...form, crn: offender.crn })
    cy.task('stubGetCourseCompletionForm', { ...form, crn: offender.crn })
    page.personSearchComponent.submitSearch()

    page.personSearchComponent.clickPerson(offender.crn)

    // Then I should see the next page of the form
    Page.verifyOnPage(PersonPage, courseCompletion)
  })

  // Scenario: Submitting the form when the offender is restricted
  it('redirects to the restricted pesron page if offender is restricted', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion, '12')

    //  When I complete the form
    page.personSearchComponent.enterSearchTerm(limitedOffender.crn)

    page.personSearchComponent.submitSearch()

    // And the offender is limited
    const caseDetailsSummaryLimited = caseDetailsSummaryFactory.build({
      offender: limitedOffender,
    })

    cy.task('stubGetOffenderSummary', { caseDetailsSummary: caseDetailsSummaryLimited })

    page.personSearchComponent.clickPerson(limitedOffender.crn)

    // Then I see the restricted person page
    Page.verifyOnPage(RestrictedPerson, limitedOffender.crn)
  })

  // Scenario: Submitting the form when the offender has no requirement
  it('redirects to the no requirements page if offender has no requirements', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion, '12')

    //  When I complete the form
    page.personSearchComponent.enterSearchTerm(offenderWithNoRequirements.crn)

    page.personSearchComponent.submitSearch()

    // And the offender has no requirement
    const caseDetailsSummaryNoRequirements = caseDetailsSummaryFactory.build({
      offender: offenderWithNoRequirements,
      unpaidWorkDetails: [],
    })

    cy.task('stubGetOffenderSummary', { caseDetailsSummary: caseDetailsSummaryNoRequirements })

    page.personSearchComponent.clickPerson(offenderWithNoRequirements.crn)

    // Then I see the no requirement page
    Page.verifyOnPage(NoRequirementsPage, new Offender(offenderWithNoRequirements).name)
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    //  Given I am on the form page
    const page = CrnPage.visit(courseCompletion, '12')

    cy.task('stubSaveCourseCompletionForm', { ...form, crn: offender.crn })
    cy.task('stubGetCourseCompletionForm', { ...form, crn: offender.crn })
    cy.task('stubGetCourseCompletionHistory', {
      id: courseCompletion.id,
      courseCompletions: [courseCompletion],
    })

    //  When I click back
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)
  })

  // Scenario: Navigates back to search results
  it('navigates back to search results', () => {
    cy.task('stubSaveCourseCompletionForm', { ...form, crn: offender.crn })
    cy.task('stubGetCourseCompletionForm', { ...form, crn: offender.crn })

    const pdu = communityCampusPduFactory.build()
    const provider = providerSummaryFactory.build()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    // Given I am on the page
    const page = CrnPage.visit(courseCompletion, '12', { pdu: pdu.id, provider: provider.code })
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: [courseCompletion],
    })

    // When I click back
    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: courseCompletion.pdu.providerCode,
        pduId: courseCompletion.pdu.id,
        username: 'some-name',
      },
      courseCompletions: courseCompletionResponse,
    })
    cy.task('stubGetCourseCompletionHistory', {
      id: courseCompletion.id,
      courseCompletions: [courseCompletion],
    })
    page.clickBack()

    // Then I should see the course completion details page
    Page.verifyOnPage(CourseCompletionPage, courseCompletion)

    // And I click back again
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

    // Then I should see the course completion search page with search results
    const searchPage = Page.verifyOnPage(SearchCourseCompletionsPage, courseCompletion)
    searchPage.shouldShowSearchResults(courseCompletion)
  })
})
