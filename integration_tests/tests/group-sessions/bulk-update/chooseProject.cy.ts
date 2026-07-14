import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import BulkUpdatePage from '../../../pages/appointments/bulkUpdatePage'
import ChooseProjectPage from '../../../pages/appointments/chooseProjectPage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import Page from '../../../pages/page'
import appointmentFactory from '../../../../server/testutils/factories/appointmentFactory'
import { updateSessionFormFactory } from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import projectOutcomeSummaryFactory from '../../../../server/testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'

context('Group Session Bulk Update - Choose Project', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const selectedAppointments = appointmentSummaryFactory.buildList(2, { contactOutcome: undefined })
    cy.wrap(selectedAppointments).as('selectedAppointments')

    const unselectedAppointment = appointmentSummaryFactory.build({ contactOutcome: undefined })
    cy.wrap(unselectedAppointment).as('unselectedAppointment')

    const session = sessionFactory.build({
      projectCode: project.projectCode,
      appointmentSummaries: [...selectedAppointments, unselectedAppointment],
    })
    cy.wrap(session).as('session')

    const form = updateSessionFormFactory.build({
      appointments: selectedAppointments.map(appointment => ({ id: appointment.id, deliusVersion: '' })),
    })
    cy.wrap(form).as('form')

    const team = providerTeamSummaryFactory.build({ code: form.projectTeam.code })
    cy.wrap(team).as('team')

    const selectedProject = projectOutcomeSummaryFactory.build({
      projectCode: form.project.code,
      projectName: form.project.name,
    })
    cy.wrap(selectedProject).as('selectedProject')

    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: project.providerCode })
    cy.task('stubGetProjects', {
      projects: { content: [selectedProject] },
      teamCode: form.projectTeam.code,
      providerCode: project.providerCode,
    })

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })
    cy.task('stubGetAppointmentForm', form)
  })

  describe('Project inputs', function describe() {
    it('should show any existing values for team and project in the form', function test() {
      const page = ChooseProjectPage.visitForSession(this.session)

      page.form.teamInput.shouldHaveValue(this.team.code)
      page.form.projectInput.shouldHaveValue(this.selectedProject.projectCode)
    })
  })

  describe('Continue', function describe() {
    it('validates team field', function test() {
      const page = ChooseProjectPage.visitForSession(this.session)

      page.form.clearTeam()
      page.clickSubmit()

      page.form.shouldShowTeamError()
      page.form.teamInput.shouldHaveValue('')
    })

    it('validates project field', function test() {
      const page = ChooseProjectPage.visitForSession(this.session)

      page.form.clearProject()
      page.clickSubmit()

      page.form.shouldShowProjectError()
      page.form.projectInput.shouldHaveValue('')
    })

    it('submits the form and navigates to the next page', function test() {
      const contactOutcomes = contactOutcomesFactory.build({
        contactOutcomes: [contactOutcomeFactory.build({ attended: true })],
      })

      cy.task('stubGetContactOutcomes', { contactOutcomes })
      cy.task('stubSaveAppointmentForm')

      const page = ChooseProjectPage.visitForSession(this.session)

      page.clickSubmit()

      Page.verifyOnPage(AttendanceOutcomePage, this.session)
    })
  })

  it('navigates back to the previous page', function test() {
    const page = ChooseProjectPage.visitForSession(this.session)

    page.clickBack()

    Page.verifyOnPage(ChooseSupervisorPage, this.session)
  })

  it('enables navigation back to change selected people', function test() {
    const page = ChooseProjectPage.visitForSession(this.session)

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
})
