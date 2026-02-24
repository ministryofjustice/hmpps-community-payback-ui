//  Feature: find a project session
//    So that I can report on a person's progress on Community Payback
//    As a case admin
//    I want to find a project session
//
//  Scenario: viewing the 'find a group session' page
//      Given I am logged in
//      When I visit the 'find a group session' page
//      Then I see the search form
//
//  Scenario: search returns no results
//    Given I am on the find a group session page
//    When I search for sessions
//    And there are no results
//    Then I see a no results message
//
//  Scenario: displaying error summary
//      Given I am logged in
//      When I visit the 'find a group session' page
//      And I only input the start date
//      And I search for sessions
//      Then I see the error summary

// Scenario: only one provider does not require me to select a provider
//    Given I am on the 'find a session' page
//    When I complete the search form without selecting a region
//    And I search for sessions
//    Then I see the search results

import sessionFactory from '../../server/testutils/factories/sessionFactory'
import sessionSummaryFactory from '../../server/testutils/factories/sessionSummaryFactory'
import providerTeamSummaryFactory from '../../server/testutils/factories/providerTeamSummaryFactory'
import FindASessionPage from '../pages/findASessionPage'
import Page from '../pages/page'
import ViewSessionPage from '../pages/viewSessionPage'
import { ProviderSummaryDto, ProviderTeamSummaryDto } from '../../server/@types/shared'
import providerSummaryFactory from '../../server/testutils/factories/providerSummaryFactory'

context('Home', () => {
  let providers: Array<ProviderSummaryDto>
  let provider: ProviderSummaryDto
  let teams: Array<ProviderTeamSummaryDto>
  beforeEach(() => {
    providers = providerSummaryFactory.buildList(2)
    provider = providers[0] // eslint-disable-line prefer-destructuring
    teams = providerTeamSummaryFactory.buildList(2)
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetProviders', { providers: { providers } })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: provider.code })
  })

  //  Scenario: viewing the home page
  it('shows the find a group session search form', () => {
    // Given I am logged in
    cy.signIn()

    //  When I visit the 'find a session' page
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    //  Then I see the search form
    page.shouldShowSearchForm()
  })

  //  Scenario: searching for sessions
  it('searches for sessions and displays results', () => {
    const [team] = teams

    // Given I am logged in
    cy.signIn()

    //  When I visit the 'find a session' page
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    // And I complete the search form
    page.selectRegion(provider)
    page.completeSearchForm()
    page.selectTeam(team)

    // And I search for sessions
    cy.task('stubGetSessions', {
      request: {
        providerCode: provider.code,
        teamCode: team.code,
        startDate: '2025-09-18',
        endDate: '2025-09-20',
        username: 'some-name',
      },
      sessions: {
        allocations: [
          {
            date: '2025-09-07',
            projectName: 'project-name',
            projectCode: 'prj',
            numberOfOffendersAllocated: 5,
            numberOfOffendersWithOutcomes: 3,
            numberOfOffendersWithEA: 1,
          },
        ],
      },
    })
    page.submitForm()

    //  Then I see the search results
    page.shouldShowSearchResults()
    page.shouldShowPopulatedSearchForm()
  })

  // Scenario: search returns no results
  it('shows a message if the search returned no results', () => {
    const [team] = teams
    //  Given I am on the find a session page
    cy.signIn()
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    // When I search for sessions
    page.selectRegion(provider)
    page.selectTeam(team)

    page.completeSearchForm()

    // And there are no results
    cy.task('stubGetSessions', {
      request: {
        providerCode: provider.code,
        teamCode: team.code,
        startDate: '2025-09-18',
        endDate: '2025-09-20',
        username: 'some-name',
      },
      sessions: {
        allocations: [],
      },
    })
    page.submitForm()

    //  Then I see a no results message
    page.shouldShowNoResultsMessage()
  })

  //  Scenario: viewing a session
  it('lets me view a session from the dashboard', () => {
    const [team] = teams

    const providerCode = provider.code
    const teamCode = team.code
    const projectCode = 'prj'
    const date = '2025-09-07'

    const session = sessionFactory.build({ date, projectCode })
    const sessionSummary = sessionSummaryFactory.build({
      date,
      projectName: 'project-name',
      projectCode,
      startTime: '09:00:00',
      endTime: '17:00:00',
      numberOfOffendersAllocated: 5,
      numberOfOffendersWithOutcomes: 3,
      numberOfOffendersWithEA: 1,
    })

    // Given I am logged in and on the sessions page
    cy.signIn()
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)
    page.selectRegion(provider)
    page.selectTeam(team)
    page.completeSearchForm()

    //  When I search for a session
    cy.task('stubGetSessions', {
      request: { providerCode, teamCode, startDate: '2025-09-18', endDate: '2025-09-20', username: 'some-name' },
      sessions: {
        allocations: [sessionSummary],
      },
    })
    page.submitForm()

    // And I click on a session in the results
    cy.task('stubFindSession', { session })
    page.clickOnASession()

    //  Then I see the session details page
    const sessionDetailsPage = Page.verifyOnPage(ViewSessionPage, session)
    sessionDetailsPage.shouldShowAppointmentsList()
    sessionDetailsPage.shouldShowSessionDetails()
  })

  //  Scenario: displaying error summary
  it('displays an error summary when form submission fails', () => {
    const [team] = teams

    // Given I am logged in
    cy.signIn()

    //  When I visit the 'find a session' page
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    // And I only input the start date
    page.selectRegion(provider)
    page.selectTeam(team)
    page.completeStartDate()

    // And I search for sessions
    page.submitForm()

    // Then I see the error summary
    page.shouldShowErrorSummary()
    page.shouldHavePaddedStartDateValue()
  })

  // Scenario: only one provider does not require me to select a provider
  it('does not show region selection if only one provider', () => {
    const [team] = teams
    // Given I am on the 'find a session' page
    cy.signIn()
    cy.task('stubGetProviders', { providers: { providers: [provider] } })

    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    // When I complete the search form without selecting a region
    page.shouldShowRegion(provider.name)
    page.selectTeam(team)

    page.completeSearchForm()

    // And I search for sessions
    cy.task('stubGetSessions', {
      request: {
        providerCode: provider.code,
        teamCode: team.code,
        startDate: '2025-09-18',
        endDate: '2025-09-20',
        username: 'some-name',
      },
      sessions: {
        allocations: [
          {
            date: '2025-09-07',
            projectName: 'project-name',
            projectCode: 'prj',
            numberOfOffendersAllocated: 5,
            numberOfOffendersWithOutcomes: 3,
            numberOfOffendersWithEA: 1,
          },
        ],
      },
    })
    page.submitForm()

    //  Then I see the search results
    page.shouldShowRegion(provider.name)
    page.shouldShowSearchResults()
    page.shouldShowPopulatedSearchForm()
  })
})
