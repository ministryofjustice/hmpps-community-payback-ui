//  Feature: View an independent placement project
//    As a case admin
//    So that I can report on people's progress on a single project
//    I want to view details about a project
//    And view any missing outcomes I need to capture
//
//  Given I am on the project page
//    Then I should see the project details

import ProjectPage from '../../pages/projects/projectPage'
import projectFactory from '../../../server/testutils/factories/projectFactory'

context('Project page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  it('shows project details', () => {
    const project = projectFactory.build()
    cy.task('stubFindProject', { project })
    //  Given I am on the project page
    const page = ProjectPage.visit(project)

    //  Then I should see the project details
    page.shouldShowProjectDetails()
  })
})
