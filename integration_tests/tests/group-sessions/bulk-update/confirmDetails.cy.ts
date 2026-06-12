import appointmentFactory from '../../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import Offender from '../../../../server/models/offender'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'
import Page from '../../../pages/page'
import ViewSessionPage from '../../../pages/viewSessionPage'

context('Group Session Bulk Update - Confirm appointment details page', () => {
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

    const appointments = session.appointmentSummaries.map(appointment =>
      appointmentFactory.build({
        ...appointment,
        projectCode: project.projectCode,
      }),
    )
    cy.wrap(appointments).as('appointments')

    const form = appointmentOutcomeFormFactory.build({
      appointments: appointments.map(appointment => ({ id: appointment.id, deliusVersion: appointment.version })),
    })
    cy.wrap(form).as('form')

    cy.task('stubGetAppointmentForm', form)
    appointments.forEach(appointment => {
      cy.task('stubFindAppointment', { appointment })
    })
  })

  describe('submit update for 2 appointments', () => {
    it('redirects back to session page with success message', function test() {
      const page = ConfirmDetailsPage.visitForSession(this.session, this.form)
      cy.task('stubBulkUpdateAppointmentOutcome', { projectCode: this.project.projectCode })

      page.clickSubmit('Confirm')

      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, this.session)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')
    })

    it('with 1 different Delius version => redirects back to session page with 1 error message and success message', function test() {
      const form = appointmentOutcomeFormFactory.build({
        appointments: [
          { id: this.appointments[0].id, deliusVersion: this.appointments[0].version },
          { id: this.appointments[1].id, deliusVersion: '1' },
        ],
      })

      cy.task('stubGetAppointmentForm', form)

      const page = ConfirmDetailsPage.visitForSession(this.session, form)

      cy.task('stubBulkUpdateAppointmentOutcome', { projectCode: this.project.projectCode })

      page.clickSubmit('Confirm')

      const viewSessionPage = Page.verifyOnPage(ViewSessionPage, this.session)
      const offender = new Offender(this.appointments[1].offender)
      const message = `The appointment for ${offender.name} (${offender.crn}) has already been updated in the database. Try again.`

      viewSessionPage.shouldShowErrorMessage(message, false)
      viewSessionPage.shouldShowSuccessMessage('Attendance recorded')
    })

    it('with API error response => stays on page and shows error message', function test() {
      const userMessage = 'Invalid bulk appointment update data'

      cy.task('stubBulkUpdateAppointmentOutcomeWithError', {
        projectCode: this.project.projectCode,
        userMessage,
      })

      const page = ConfirmDetailsPage.visitForSession(this.session, this.form)
      page.clickSubmit('Confirm')

      page.shouldShowErrorSummary(userMessage)
    })
  })
})
