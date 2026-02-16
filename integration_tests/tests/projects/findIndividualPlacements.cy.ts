//  Feature: show all individual placements for a given team
//    So that I can report on a person's progress on Community Payback
//    As a case admin
//    I want to see all individual placements for a team
//
//    Scenario: viewing the 'Find an individual placement' page
//      Given I am logged in
//      When I visit the 'find an individual placement' page
//      Then I see the filter form
//
//    Scenario: searching for individual placements
//      Given I am logged in
//      When I visit the 'Find an individual placement' page
//      And I select a team
//      And I submit the form
//      Then I should see a list of individual placement projects sorted with the most amount of missing outcomes first
//
//    Scenario: showing empty results for individual placements
//      Given I am logged in
//      When I visit the 'Find an individual placement' page
//      And I select a team
//      And I submit the form
//      Then I should see a no results message
//
//    Scenario: navigating to a single individual placement
//      Given I am logged in
//      When I visit the 'Find an individual placement' page
//      And I select a team
//      And I submit the form
//      And I see a list of individual placement projects sorted with the most amount of missing outcomes first
//      When I click on an individual placement
//      Then I should see the individual placement page
//
//    Scenario: navigating back to the home page
//      Given I am logged in
//      When I visit the 'Find an individual placement' page
//      And I click the back button
//      Then I should see the home page
//
//    Scenario: navigating back to the home page after showing results
//      Given I am logged in
//      When I visit the 'Find an individual placement' page
//      And I select a team
//      And I submit the form
//      And I click the back button
//      Then I should see the home page
//
//    Scenario: clearing search results
//      Given I am logged in
//      When I visit the 'Find an individual placement' page
//      And I select a team
//      And I submit the form
//      Then I should see a list of individual placement projects sorted with the most amount of missing outcomes first
//      And I click clear
//      Then I should not see the results

import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import { baseProjectAppointmentRequest } from '../../mockApis/projects'
import HomePage from '../../pages/homePage'
import Page from '../../pages/page'
import FindIndividualPlacementPage from '../../pages/projects/findIndividualPlacementPage'
import ProjectPage from '../../pages/projects/projectPage'

context('Individual placements', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  // Scenario: viewing the 'Find an individual placement' page
  it('shows the find an individual placement page', () => {
    // Given I am logged in
    cy.signIn()

    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [{ id: 1, name: 'Team 1', code: 'XRTC12' }] } })
    FindIndividualPlacementPage.visit()
    const page = Page.verifyOnPage(FindIndividualPlacementPage)

    // Then I see the search form
    page.shouldShowSearchForm()
  })

  // Scenario: searching for individual placements
  it('searches for individual placements and displays results', () => {
    // Given I am logged in
    cy.signIn()

    const team = { id: 1, name: 'Team 1', code: 'XRTC12' }
    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [team] } })
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    cy.task('stubGetProjects', { teamCode: team.code, providerCode: 'N56', projects })

    FindIndividualPlacementPage.visit(projects.content)
    const page = Page.verifyOnPage(FindIndividualPlacementPage, projects.content)

    // And I select a team
    page.selectTeam()

    // And I submit the form
    page.clickSubmit('Apply filters')

    // Then I should see a list of individual placement projects sorted with the most amount of missing outcomes first
    page.shouldShowIndividualPlacementsSortedDescendingByMissingOutcomes()
  })

  // Scenario: showing empty results for individual placements
  it('shows empty results for individual placements', () => {
    // Given I am logged in
    cy.signIn()

    const team = { id: 1, name: 'Team 1', code: 'XRTC12' }
    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [team] } })
    FindIndividualPlacementPage.visit()
    const page = Page.verifyOnPage(FindIndividualPlacementPage)

    // And I select a team
    page.selectTeam()

    // And I submit the form
    const projects = pagedModelProjectOutcomeSummaryFactory.build({
      content: [],
    })

    cy.task('stubGetProjects', { teamCode: team.code, providerCode: 'N56', projects })
    page.clickSubmit('Apply filters')

    // Then I should see a no results message
    page.shouldShowEmptyResults()
  })

  // Scenario: navigating to a single individual placement
  it('navigates to a single individual placement', () => {
    // Given I am logged in
    cy.signIn()

    const team = { id: 1, name: 'Team 1', code: 'XRTC12' }
    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [team] } })
    const projects = pagedModelProjectOutcomeSummaryFactory.build()

    cy.task('stubGetProjects', { teamCode: team.code, providerCode: 'N56', projects })

    FindIndividualPlacementPage.visit(projects.content)
    const page = Page.verifyOnPage(FindIndividualPlacementPage, projects.content)

    // And I select a team
    page.selectTeam()

    // And I submit the form
    page.clickSubmit('Apply filters')

    // And I see a list of individual placement projects sorted with the most amount of missing outcomes first
    page.shouldShowIndividualPlacementsSortedDescendingByMissingOutcomes()

    // When I click on an individual placement
    const projectStub = projectFactory.build({
      projectCode: page.getFirstIndividualPlacement().projectCode,
      projectName: page.getFirstIndividualPlacement().projectName,
    })
    cy.task('stubFindProject', { project: projectStub })

    const request = { ...baseProjectAppointmentRequest(), projectCodes: [projectStub.projectCode] }
    cy.task('stubGetAppointments', { request, pagedAppointments: pagedModelAppointmentSummaryFactory.build() })

    page.clickFirstIndividualPlacement()

    // Then I should see the individual placement page
    Page.verifyOnPage(ProjectPage, projectStub)
  })

  // Scenario: navigating back to the home page
  it('navigates back to the home page', () => {
    // Given I am logged in
    cy.signIn()

    const team = { id: 1, name: 'Team 1', code: 'XRTC12' }
    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [team] } })
    FindIndividualPlacementPage.visit()
    const page = Page.verifyOnPage(FindIndividualPlacementPage)

    // And I click the back button
    page.clickBack()

    // Then I should see the home page
    Page.verifyOnPage(HomePage)
  })

  // Scenario: navigating back to the home page after showing results
  it('navigates back to the home page after showing results', () => {
    // Given I am logged in
    cy.signIn()

    const team = { id: 1, name: 'Team 1', code: 'XRTC12' }
    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [team] } })
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    cy.task('stubGetProjects', { teamCode: team.code, providerCode: 'N56', projects })

    FindIndividualPlacementPage.visit()
    const page = Page.verifyOnPage(FindIndividualPlacementPage)

    // And I select a team
    page.selectTeam()

    // And I submit the form
    page.clickSubmit('Apply filters')

    // And I click the back button
    page.clickBack()

    // Then I should see the home page
    Page.verifyOnPage(HomePage)
  })

  // Scenario: clearing search results
  it('clears the search results', () => {
    // Given I am logged in
    cy.signIn()

    const team = { id: 1, name: 'Team 1', code: 'XRTC12' }
    // When I visit the 'Find an individual placement' page
    cy.task('stubGetTeams', { teams: { providers: [team] } })
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    cy.task('stubGetProjects', { teamCode: team.code, providerCode: 'N56', projects })

    FindIndividualPlacementPage.visit(projects.content)
    const page = Page.verifyOnPage(FindIndividualPlacementPage, projects.content)

    // And I select a team
    page.selectTeam()

    // And I submit the form
    page.clickSubmit('Apply filters')

    // Then I should see a list of individual placement projects sorted with the most amount of missing outcomes first
    page.shouldShowIndividualPlacementsSortedDescendingByMissingOutcomes()

    // And I click clear
    page.clickClear()

    // Then I should not see the results
    page.shouldNotShowResults()
  })
})
