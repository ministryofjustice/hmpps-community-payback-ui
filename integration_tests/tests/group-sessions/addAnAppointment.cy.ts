import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import ViewSessionPage from '../../pages/viewSessionPage'
import Page from '../../pages/page'
import probationSearchResponseFactory from '../../../server/testutils/factories/probationSearchResponseFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'

context('add an appointment', () => {
  const date = '2025-09-19'
  const projectCode = 'prj'

  const session = sessionFactory.build({ date, projectCode })

  const probationSearchResponse = probationSearchResponseFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubSearchPerson', probationSearchResponse)
  })

  it('navigates to find a person page', () => {
    // And I click on a session in the results
    cy.task('stubFindSession', { session })
    const project = projectFactory.build({
      projectCode: session.projectCode,
    })
    cy.task('stubFindProject', { project })

    ViewSessionPage.visit(session)

    //  Then I see the session details page
    const sessionDetailsPage = Page.verifyOnPage(ViewSessionPage, session)

    sessionDetailsPage.clickAddAnAppointment()
    cy.get('#search').type('test')
    cy.get('button').click()
  })
})
