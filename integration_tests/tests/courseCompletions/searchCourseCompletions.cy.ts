//  Feature: Search course completions
//    So that I can report on a person's progress on Community Payback
//    As a case admin
//    I want to search for course completions
//
//  Scenario: viewing the 'search course completions' page
//    Given I am logged in
//    When I visit the 'search course completions' page
//    Then I see the search form
//
//  Scenario: searching for course completions
//    Given I am logged in
//    When I visit the 'search course completions' page
//    And I complete the search form
//    And I click submit
//    Then I see the search results
//
//  Scenario: navigating through paginated results
//    Given I am on the search course completions page
//    When I complete the search form
//    And I click submit
//    And there are multiple pages of results
//    Then I see pagination controls
//    When I click to the next page of results
//    Then I see the next page of results
//
//  Scenario: search returns no results
//    Given I am on the search course completions page
//    When I click submit
//    And there are no results
//    Then I see a no results message
//
//  Scenario: displaying error summary
//    Given I am logged in
//    When I visit the 'search course completions' page
//    And I only input the start date
//    And I click submit
//    Then I see the error summary
//
//  Scenario: navigating to course completion details
//    Given I am logged in
//    When I visit the 'search course completions' page
//    And I complete the search form
//    And I click submit
//    And I click the view link for a course completion
//    Then I am on the course completion details page
//    And I see the course completion details

import courseCompletionFactory from '../../../server/testutils/factories/courseCompletionFactory'
import pagedMetadataFactory from '../../../server/testutils/factories/pagedMetadataFactory'
import pagedModelCourseCompletionEventFactory from '../../../server/testutils/factories/pagedModelCourseCompletionEventFactory'
import CourseCompletionPage from '../../pages/courseCompletions/courseCompletionPage'
import SearchCourseCompletionsPage from '../../pages/courseCompletions/searchCourseCompletionsPage'
import Page from '../../pages/page'

context('Search course completions', () => {
  beforeEach(function test() {
    cy.task('reset')
    cy.task('stubSignIn')

    // Given I am logged in
    cy.signIn()
  })

  //  Scenario: viewing the 'search course completions' page
  it('shows the search course completions form', function test() {
    //  When I visit the 'search course completions' page
    SearchCourseCompletionsPage.visit()
    const page = Page.verifyOnPage(SearchCourseCompletionsPage)

    //  Then I see the search form
    page.shouldShowSearchForm()
  })

  //  Scenario: searching for course completions
  it('searches for course completions and displays results', function test() {
    //  When I visit the 'search course completions' page
    SearchCourseCompletionsPage.visit()
    const page = Page.verifyOnPage(SearchCourseCompletionsPage)

    // And I complete the search form
    page.completeSearchForm()

    // And I click submit
    const courseCompletion = courseCompletionFactory.build()
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: [courseCompletion],
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: 'N56',
        dateFrom: '2025-09-18',
        dateTo: '2025-09-20',
        username: 'some-name',
      },
      courseCompletions: courseCompletionResponse,
    })

    page.submitForm()

    // Then I see the search results
    page.shouldShowSearchResults(courseCompletion)
  })

  // Scenario: navigating through paginated results
  it('shows pagination controls and allows navigating to next page of results', function test() {
    // Given I am on the search course completions page
    SearchCourseCompletionsPage.visit()
    const page = Page.verifyOnPage(SearchCourseCompletionsPage)

    // When I complete the search form
    page.completeSearchForm()

    // And I click submit
    const courseCompletions = courseCompletionFactory.buildList(11)
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: courseCompletions,
      page: pagedMetadataFactory.build({
        size: 10,
        number: 0,
        totalElements: 11,
        totalPages: 2,
      }),
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: 'N56',
        dateFrom: '2025-09-18',
        dateTo: '2025-09-20',
        username: 'some-name',
        page: 0,
        size: 10,
      },
      courseCompletions: courseCompletionResponse,
    })

    page.submitForm()

    // Then I see pagination controls
    page.shouldShowPaginationControls()

    // When I click to the next page of results
    const nextPageCourseCompletions = courseCompletionFactory.buildList(1)
    const nextPageCourseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: nextPageCourseCompletions,
      page: pagedMetadataFactory.build({
        number: 1,
        size: 10,
        totalElements: 11,
        totalPages: 2,
      }),
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: 'N56',
        dateFrom: '2025-09-18',
        dateTo: '2025-09-20',
        username: 'some-name',
        page: 1,
        size: 10,
      },
      courseCompletions: nextPageCourseCompletionResponse,
    })

    page.clickNextPage()

    // Then I see the next page of results
    page.shouldShowSearchResults(nextPageCourseCompletions[0])
  })

  //  Scenario: search returns no results
  it('shows a no results message when there are no search results', function test() {
    // Given I am on the search course completions page
    SearchCourseCompletionsPage.visit()
    const page = Page.verifyOnPage(SearchCourseCompletionsPage)

    // When I click submit
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: [],
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: 'N56',
        dateFrom: '2025-09-18',
        dateTo: '2025-09-20',
        username: 'some-name',
      },
      courseCompletions: courseCompletionResponse,
    })

    page.completeSearchForm()
    page.submitForm()

    // Then I see a no results message
    page.shouldShowNoResultsMessage()
  })

  //  Scenario: displaying error summary
  it('shows an error summary when there are validation errors', function test() {
    //  When I visit the 'search course completions' page
    SearchCourseCompletionsPage.visit()
    const page = Page.verifyOnPage(SearchCourseCompletionsPage)

    // And I only input the start date
    page.completeStartDate()

    // And I click submit
    page.submitForm()

    // Then I see the error summary
    page.shouldShowErrorSummary()
  })

  //  Scenario: navigating to course completion details
  it('navigates to course completion details page when view link is clicked', function test() {
    //  When I visit the 'search course completions' page
    SearchCourseCompletionsPage.visit()
    const page = Page.verifyOnPage(SearchCourseCompletionsPage)

    // And I complete the search form
    page.completeSearchForm()

    // And I click submit
    const courseCompletion = courseCompletionFactory.build()
    const courseCompletionResponse = pagedModelCourseCompletionEventFactory.build({
      content: [courseCompletion],
    })

    cy.task('stubGetCourseCompletions', {
      request: {
        providerCode: 'N56',
        dateFrom: '2025-09-18',
        dateTo: '2025-09-20',
        username: 'some-name',
      },
      courseCompletions: courseCompletionResponse,
    })

    page.submitForm()

    // And I click the view link for a course completion
    cy.task('stubFindCourseCompletion', { courseCompletion })
    page.clickViewCourseCompletion()

    // Then I am on the course completion details page
    const viewCourseCompletionPage = Page.verifyOnPage(CourseCompletionPage, courseCompletion)

    // And I see the course completion details
    viewCourseCompletionPage.shouldShowCourseCompletionDetails()
  })
})
