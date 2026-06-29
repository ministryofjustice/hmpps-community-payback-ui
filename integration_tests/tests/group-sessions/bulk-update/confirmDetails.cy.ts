import appointmentFactory from '../../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import sessionSummaryFactory from '../../../../server/testutils/factories/sessionSummaryFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import BulkUpdatePage from '../../../pages/appointments/bulkUpdatePage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'
import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import FindASessionPage from '../../../pages/findASessionPage'
import Page from '../../../pages/page'
import ViewSessionPage from '../../../pages/viewSessionPage'
import attendanceDataFactory from '../../../../server/testutils/factories/attendanceDataFactory'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import updateAppointmentOutcomeResultFactory from '../../../../server/testutils/factories/updateAppointmentOutcomeResultFactory'

context('Group Session Bulk Update - Confirm appointment details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const session = sessionFactory.build({
      projectCode: project.projectCode,
      appointmentSummaries: appointmentSummaryFactory.buildList(3, { contactOutcome: undefined }),
    })
    cy.wrap(session).as('session')

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })

    const appointments = session.appointmentSummaries.map(appointment =>
      appointmentFactory.build({
        ...appointment,
        projectCode: project.projectCode,
      }),
    )

    const unselectedAppointment = appointments.pop()
    cy.wrap(appointments).as('appointments')
    cy.wrap(unselectedAppointment).as('unselectedAppointment')

    const form = appointmentOutcomeFormFactory.build({
      contactOutcome: contactOutcomeFactory.build({ attended: true }),
      appointments: appointments.map(appointment => ({ id: appointment.id, deliusVersion: appointment.version })),
    })
    cy.wrap(form).as('form')

    cy.task('stubGetAppointmentForm', form)
    appointments.forEach(appointment => {
      cy.task('stubFindAppointment', { appointment })
    })
  })

  describe('view details and edit sections', () => {
    it('shows all completed answers for an attended update', function test() {
      const form = appointmentOutcomeFormFactory.build({
        startTime: '09:00',
        endTime: '16:00',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        attendanceData: attendanceDataFactory.build({
          hiVisWorn: false,
          penaltyMinutes: 60,
          workedIntensively: false,
          workQuality: 'GOOD',
          behaviour: 'NOT_APPLICABLE',
        }),
        notes: 'Test',
        isSensitive: undefined,
        appointments: this.appointments.map(appointment => ({
          id: appointment.id,
          deliusVersion: appointment.version,
        })),
      })

      cy.task('stubGetAppointmentForm', form)

      const page = ConfirmDetailsPage.visitForSession(this.session, form)

      page.shouldShowCompletedDetails()
      page.shouldShowAttendanceDetails(false)
      page.shouldNotShowSensitiveQuestion()
      page.shouldShowSelectedPeople(this.appointments)
      page.shouldNotShowSelectedPeople([this.unselectedAppointment])
    })

    describe('navigating back via change links', () => {
      it('navigates to choose supervisor when editing supervising officer', function test() {
        const teams = providerTeamSummaryFactory.buildList(2)
        cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })

        const page = ConfirmDetailsPage.visitForSession(this.session, this.form)

        page.clickChange('Supervising officer')

        // Would verify the selected supervisor is selected but this currently needs fixing
        Page.verifyOnPage(ChooseSupervisorPage, this.session)
      })

      it('navigates to attendance outcome when editing attendance', function test() {
        const contactOutcomes = contactOutcomesFactory.build()
        cy.task('stubGetContactOutcomes', { contactOutcomes })

        const page = ConfirmDetailsPage.visitForSession(this.session, this.form)

        page.clickChange('Attendance')

        Page.verifyOnPage(AttendanceOutcomePage, this.session)
      })

      it('navigates to log hours when editing start and end time', function test() {
        const page = ConfirmDetailsPage.visitForSession(this.session, this.form)

        page.clickChange('Start and end time')

        Page.verifyOnPage(LogHoursPage, this.session)
      })

      it('navigates to log compliance when editing compliance', function test() {
        const page = ConfirmDetailsPage.visitForSession(this.session, this.form)

        page.clickChange('Compliance')

        Page.verifyOnPage(LogCompliancePage, this.session)
      })

      it('navigates to attendance outcome when editing notes', function test() {
        const contactOutcomes = contactOutcomesFactory.build()
        cy.task('stubGetContactOutcomes', { contactOutcomes })

        const page = ConfirmDetailsPage.visitForSession(this.session, this.form)

        page.clickChange('Notes')

        Page.verifyOnPage(AttendanceOutcomePage, this.session)
      })

      it('navigates to bulk update page via the People change link', function test() {
        cy.task('stubSaveAppointmentForm')

        const page = ConfirmDetailsPage.visitForSession(this.session, this.form)

        page.clickChange('People')

        const bulkUpdatePage = Page.verifyOnPage(BulkUpdatePage, this.session)
        bulkUpdatePage.shouldShowSelectedPeople(this.appointments)
        bulkUpdatePage.shouldShowNotSelectedPeople([this.unselectedAppointment])
      })
    })
  })

  describe('submit update for 2 appointments', () => {
    it('redirects back to session page with success message', function test() {
      const provider = providerSummaryFactory.build()
      const team = providerTeamSummaryFactory.build()
      const originalSearch = {
        provider: provider.code,
        team: team.code,
        date: '18/09/2025',
      }

      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        appointments: this.appointments.map(appointment => ({
          id: appointment.id,
          deliusVersion: appointment.version,
        })),
        originalSearch,
      })

      cy.task('stubGetAppointmentForm', form)

      const page = ConfirmDetailsPage.visitForSession(this.session, form)
      const results = updateAppointmentOutcomeResultFactory.buildList(2)
      cy.task('stubBulkUpdateAppointmentOutcome', { projectCode: this.project.projectCode, results })

      page.clickSubmit('Confirm')

      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, this.session)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')

      cy.task('stubGetProviders', { providers: { providers: [provider] } })
      cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: provider.code })
      const sessionSummary = sessionSummaryFactory.build()
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

      viewSessionPage.clickBack()

      const searchPage = Page.verifyOnPage(FindASessionPage)
      searchPage.shouldShowSearchResults(sessionSummary)
    })

    it('with some results having errors => redirects back to session page with error message', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        appointments: this.appointments.map(appointment => ({
          id: appointment.id,
          deliusVersion: appointment.version,
        })),
      })

      cy.task('stubGetAppointmentForm', form)

      const page = ConfirmDetailsPage.visitForSession(this.session, form)
      const results = [
        { deliusId: this.appointments[0].id, result: 'SUCCESS' },
        { deliusId: this.appointments[1].id, result: 'SERVER_ERROR' },
      ]
      cy.task('stubBulkUpdateAppointmentOutcome', { projectCode: this.project.projectCode, results })

      page.clickSubmit('Confirm')

      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, this.session)
      viewSessionPage.shouldShowErrorMessage(
        'Some information could not be bulk updated. Update the missing attendance outcomes individually',
        false,
      )
    })
  })
})
