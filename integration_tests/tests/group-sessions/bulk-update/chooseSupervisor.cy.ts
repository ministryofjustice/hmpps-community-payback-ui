import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import supervisorSummaryFactory from '../../../../server/testutils/factories/supervisorSummaryFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../../../server/testutils/factories/contactOutcomeFactory'

context('Group Session Bulk Update - Choose Supervisor', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const session = sessionFactory.build({ projectCode: project.projectCode })
    cy.wrap(session).as('session')

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })
    cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build())
    cy.task('stubSaveAppointmentForm')
  })

  // Scenario: sees validation errors with any entered answers when form is not valid
  it('validates form data', function test() {
    const teams = providerTeamSummaryFactory.buildList(2)
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })

    const page = ChooseSupervisorPage.visitForSession(this.session)
    page.clickSubmit()

    page.shouldShowErrorSummary('team', 'Select a supervising team')
  })

  // Scenario: can complete the form and navigate to the next page
  describe('submit', function describe() {
    it('submits the form and navigates to the next page', function test() {
      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })

      const supervisors = supervisorSummaryFactory.buildList(2)
      cy.task('stubGetSupervisors', {
        teamCode: teams[0].code,
        providerCode: this.project.providerCode,
        supervisors,
      })

      cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes: contactOutcomeFactory.buildList(2) } })

      const page = ChooseSupervisorPage.visitForSession(this.session)

      page.selectTeam(teams[0].code)
      page.supervisorInput.select(supervisors[0].code)
      page.clickSubmit()

      Page.verifyOnPage(AttendanceOutcomePage, this.session)
    })
  })
})
