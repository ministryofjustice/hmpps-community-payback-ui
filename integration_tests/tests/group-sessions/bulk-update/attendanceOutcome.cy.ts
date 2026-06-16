import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import LogHoursPage from '../../../pages/appointments/logHoursPage'

context('Group Session Bulk Update - Attendance Outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const session = sessionFactory.build({ projectCode: project.projectCode })
    cy.wrap(session).as('session')

    const attendedOutcome = contactOutcomeFactory.build({ attended: true })
    const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [attendedOutcome] })
    cy.wrap(contactOutcomes).as('contactOutcomes')

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build())
  })

  // Scenario: sees validation errors with any entered answers when form is not valid
  it('validates form data', function test() {
    const page = AttendanceOutcomePage.visitForSession(this.session)
    page.clickSubmit()

    page.shouldShowErrorSummary('attendanceOutcome', 'Select an attendance outcome')
  })

  // Scenario: can navigate back to the previous page
  it('navigates back to the previous page', function test() {
    const teams = providerTeamSummaryFactory.buildList(2)

    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })

    const page = AttendanceOutcomePage.visitForSession(this.session)
    page.clickBack()

    Page.verifyOnPage(ChooseSupervisorPage, this.session)
  })

  // Scenario: can complete the form and navigate to the next page
  describe('submit', function describe() {
    it('submits the form and navigates to the next page', function test() {
      const page = AttendanceOutcomePage.visitForSession(this.session)
      page.notesQuestions.shouldNotShowIsSensitiveQuestion()

      page.completeForm(this.contactOutcomes.contactOutcomes[0].code, false)

      cy.task('stubSaveAppointmentForm')
      page.clickSubmit()

      Page.verifyOnPage(LogHoursPage, this.session)
    })
  })
})
