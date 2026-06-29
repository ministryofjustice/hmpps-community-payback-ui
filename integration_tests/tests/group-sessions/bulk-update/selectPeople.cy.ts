import appointmentFactory from '../../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import sessionSummaryFactory from '../../../../server/testutils/factories/sessionSummaryFactory'
import BulkUpdatePage from '../../../pages/appointments/bulkUpdatePage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import FindASessionPage from '../../../pages/findASessionPage'
import Page from '../../../pages/page'
import ViewSessionPage from '../../../pages/viewSessionPage'

context('Group Session Bulk Update - Bulk Update', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const appointmentSummaryWithContactOutcome = appointmentSummaryFactory.build({
      projectCode: project.projectCode,
    })

    const selectableAppointments = appointmentSummaryFactory.buildList(3, {
      projectCode: project.projectCode,
      contactOutcome: undefined,
    })

    const session = sessionFactory.build({
      projectCode: project.projectCode,
      appointmentSummaries: [...selectableAppointments, appointmentSummaryWithContactOutcome],
    })
    cy.wrap(session).as('session')

    const selectedAppointments = selectableAppointments.slice(0, 2)
    cy.wrap(selectedAppointments).as('selectedAppointments')

    const unselectedAppointment = selectableAppointments[2]
    cy.wrap(unselectedAppointment).as('unselectedAppointment')

    const form = appointmentOutcomeFormFactory.build({
      appointments: selectedAppointments.map(appointment => ({
        id: appointment.id,
        deliusVersion: '',
      })),
    })
    cy.wrap(form).as('form')

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })
    cy.task('stubGetAppointmentForm', form)
    cy.task('stubSaveAppointmentForm')
  })

  describe('visit with form query parameter', function describe() {
    it('shows any selected appointments', function test() {
      cy.task('stubGetAppointmentForm', this.form)

      const page = BulkUpdatePage.visitForSession(this.session, '123')

      page.shouldShowSelectedPeople(this.selectedAppointments)
      page.shouldShowNotSelectedPeople([this.unselectedAppointment])
    })

    it('can navigate back to session list', function test() {
      const provider = providerSummaryFactory.build()
      const team = providerTeamSummaryFactory.build()

      const form = appointmentOutcomeFormFactory.build({
        originalSearch: {
          provider: provider.code,
          team: team.code,
          date: '18/09/2025',
        },
      })

      const sessionSummary = sessionSummaryFactory.build({
        projectCode: this.session.projectCode,
        projectName: this.session.projectName,
        date: this.session.date,
      })

      cy.task('stubGetAppointmentForm', form)
      cy.task('stubGetProviders', { providers: { providers: [provider] } })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: provider.code })
      cy.task('stubGetSessions', {
        request: {
          providerCode: provider.code,
          teamCode: team.code,
          startDate: '2025-09-18',
          endDate: '2025-09-18',
          username: 'some-name',
        },
        sessions: {
          content: [sessionSummary],
        },
      })

      const page = BulkUpdatePage.visitForSession(this.session, '123')
      page.clickBack()

      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, this.session)
      viewSessionPage.clickBack()

      const findASessionPage = Page.verifyOnPage(FindASessionPage)
      findASessionPage.shouldShowPopulatedDate('18/09/2025')
      findASessionPage.shouldShowSearchResults(sessionSummary)
    })
  })

  describe('visit without form query parameter', function describe() {
    it('can select one or more appointments and continue to the choose supervisor page', function test() {
      this.selectedAppointments.forEach(summary => {
        const appointment = appointmentFactory.build({
          id: summary.id,
          projectCode: this.project.projectCode,
          date: this.session.date,
          offender: summary.offender,
        })
        cy.task('stubFindAppointment', { appointment })
      })

      const teams = providerTeamSummaryFactory.buildList(2)
      cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })

      const page = BulkUpdatePage.visitForSession(this.session)
      page.selectPeople(this.selectedAppointments)
      page.clickSubmit()

      const supervisorPage = Page.verifyOnPage(ChooseSupervisorPage, this.session)
      supervisorPage.selectedPeopleCard.shouldShowSelectedPeople(this.selectedAppointments)

      supervisorPage.selectedPeopleCard.shouldNotShowPeople([this.unselectedAppointment])
    })

    it('shows validation errors if user attempts to continue without selecting an appointment', function test() {
      cy.task('stubSaveAppointmentForm')
      cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build({ appointments: [] }))
      const page = BulkUpdatePage.visitForSession(this.session)
      page.clickSubmit()

      page.shouldShowErrorSummary('appointments', 'Select people with the same outcome')
      page.shouldNotHaveAnySelectedPeople()
    })

    it('retains original session search results when navigating back', function test() {
      const provider = providerSummaryFactory.build()
      const team = providerTeamSummaryFactory.build()
      const originalSearch = {
        provider: provider.code,
        team: team.code,
        date: '18/09/2025',
      }

      const sessionSummary = sessionSummaryFactory.build({
        projectCode: this.session.projectCode,
        projectName: this.session.projectName,
        date: this.session.date,
      })

      cy.task('stubGetProviders', { providers: { providers: [provider] } })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: provider.code })
      cy.task('stubGetSessions', {
        request: {
          providerCode: provider.code,
          teamCode: team.code,
          startDate: '2025-09-18',
          endDate: '2025-09-18',
          username: 'some-name',
        },
        sessions: {
          content: [sessionSummary],
        },
      })

      const sessionPage = ViewSessionPage.visitForSearch(this.session, originalSearch)
      sessionPage.clickBulkUpdate()

      const selectPeoplePage = Page.verifyOnPage(BulkUpdatePage, this.session)
      selectPeoplePage.clickBack()

      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, this.session)
      viewSessionPage.clickBack()

      const findASessionPage = Page.verifyOnPage(FindASessionPage)
      findASessionPage.shouldShowPopulatedDate('18/09/2025')
      findASessionPage.shouldShowSearchResults(sessionSummary)
    })
  })
})
