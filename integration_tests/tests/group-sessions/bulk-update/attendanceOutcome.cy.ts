import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import BulkUpdatePage from '../../../pages/appointments/bulkUpdatePage'
import appointmentFactory from '../../../../server/testutils/factories/appointmentFactory'
import ChooseProjectPage from '../../../pages/appointments/chooseProjectPage'
import { updateSessionFormFactory } from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'

context('Group Session Bulk Update - Attendance Outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')
    const selectedAppointments = appointmentSummaryFactory.buildList(2, {
      contactOutcome: undefined,
      projectCode: project.projectCode,
    })
    cy.wrap(selectedAppointments).as('selectedAppointments')
    const unselectedAppointment = appointmentSummaryFactory.build({
      contactOutcome: undefined,
      projectCode: project.projectCode,
    })
    cy.wrap(unselectedAppointment).as('unselectedAppointment')
    const session = sessionFactory.build({
      projectCode: project.projectCode,
      appointmentSummaries: [...selectedAppointments, unselectedAppointment],
    })
    cy.wrap(session).as('session')

    const attendedOutcome = contactOutcomeFactory.build({ attended: true })
    const contactOutcomes = contactOutcomesFactory.build({ contactOutcomes: [attendedOutcome] })
    cy.wrap(contactOutcomes).as('contactOutcomes')

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })
    cy.task('stubGetContactOutcomes', { contactOutcomes })
    cy.task(
      'stubGetAppointmentForm',
      updateSessionFormFactory.build({
        appointments: selectedAppointments.map(appointment => ({ id: appointment.id, deliusVersion: '' })),
        projectTeam: providerTeamSummaryFactory.build({ code: project.teamCode }),
      }),
    )
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

    const projects = projectFactory.buildList(1, { projectCode: this.project.projectCode })
    cy.task('stubGetProjects', { projects, teamCode: this.project.teamCode, providerCode: this.project.providerCode })

    const page = AttendanceOutcomePage.visitForSession(this.session)
    page.clickBack()

    Page.verifyOnPage(ChooseProjectPage, this.session)
  })

  // Scenario: can view and change people selected on the bulk update
  it('enables navigation back to change selected people', function test() {
    const page = AttendanceOutcomePage.visitForSession(this.session)
    page.selectedPeopleCard.shouldShowSelectedPeople(this.selectedAppointments)
    page.selectedPeopleCard.shouldNotShowPeople([this.unselectedAppointment])
    cy.task('stubSaveAppointmentForm')

    const selectable = [...this.selectedAppointments, this.unselectedAppointment]

    selectable.forEach(appointmentSummary => {
      const appointment = appointmentFactory.build({ ...appointmentSummary, projectCode: this.project.projectCode })
      cy.task('stubFindAppointment', { appointment })
    })

    page.selectedPeopleCard.clickChangeLink()

    const bulkUpdatePage = Page.verifyOnPage(BulkUpdatePage, this.session)
    bulkUpdatePage.shouldShowSelectedPeople(this.selectedAppointments)
    bulkUpdatePage.shouldShowNotSelectedPeople([this.unselectedAppointment])
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
