//  Feature: view a project session
//    So that I can see the details of a Community Payback session
//    As a case admin
//    I want to view a project session

import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import ViewSessionPage from '../../pages/viewSessionPage'
import BulkUpdatePage from '../../pages/appointments/bulkUpdatePage'
import Page from '../../pages/page'
import offenderLimitedFactory from '../../../server/testutils/factories/offenderLimitedFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'

context('view a session', () => {
  const date = '2025-09-19'
  const projectCode = 'prj'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  describe('bulk update', () => {
    it('shows bulk update button and navigates to bulk update page when clicked', () => {
      const appointmentSummaryWithoutOutcome = appointmentSummaryFactory.build({
        projectCode,
        contactOutcome: undefined,
      })
      const appointmentSummaryWithOutcome = appointmentSummaryFactory.build({
        projectCode,
      })

      const session = sessionFactory.build({
        date,
        projectCode,
        appointmentSummaries: [appointmentSummaryWithoutOutcome, appointmentSummaryWithOutcome],
      })

      cy.task('stubFindSession', { session })

      const sessionDetailsPage = ViewSessionPage.visitForSearch(session)
      sessionDetailsPage.shouldShowAppointmentsList()

      cy.task('stubGetAppointmentForm', appointmentOutcomeFormFactory.build({ appointments: [] }))
      cy.task('stubSaveAppointmentForm')

      sessionDetailsPage.clickBulkUpdate()

      const bulkUpdatePage = Page.verifyOnPage(BulkUpdatePage, session)
      bulkUpdatePage.shouldShowNotSelectedPeople([appointmentSummaryWithoutOutcome])
    })

    it('does not show bulk update button when all appointments have contact outcomes', () => {
      const appointmentSummaries = appointmentSummaryFactory.buildList(2, {
        projectCode,
      })
      const appointmentForLimitedOffender = appointmentSummaryFactory.build({
        offender: offenderLimitedFactory.build(),
      })

      const session = sessionFactory.build({
        date,
        projectCode,
        appointmentSummaries: [...appointmentSummaries, appointmentForLimitedOffender],
      })

      cy.task('stubFindSession', { session })

      const sessionDetailsPage = ViewSessionPage.visitForSearch(session)
      sessionDetailsPage.shouldNotShowBulkUpdateButton()
    })
  })
})
