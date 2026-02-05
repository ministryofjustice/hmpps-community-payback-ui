//  Feature: View an independent placement project
//    So that I can report on people's progress on a single project
//    As a case admin
//    I want to view details about a project
//    And view any missing outcomes I need to capture
//
//  Given I am on the project page
//    Then I should see the project details

import ProjectPage from '../../pages/projects/projectPage'

context('Project page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  it('shows project details and information about people with missing outcomes', () => {
    //  Given I am on the project page
    const page = ProjectPage.visit()

    //  Then I should see the project details
    page.shouldShowProjectDetails()
  })
})
