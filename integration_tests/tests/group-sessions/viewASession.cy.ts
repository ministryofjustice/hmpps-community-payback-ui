//  Feature: view a project session
//    So that I can see the details of a Community Payback session
//    As a case admin
//    I want to view a project session

//  Scenario: navigating through to the view appointments page
//    Given I am viewing a project session
//    When I click an offender's name link
//    Then I can see the offender's appointments relating to the requirement of that appointment

import sessionFactory from '../../../server/testutils/factories/sessionFactory'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import ViewSessionPage from '../../pages/viewSessionPage'
import BulkUpdatePage from '../../pages/appointments/bulkUpdatePage'
import Page from '../../pages/page'
import offenderLimitedFactory from '../../../server/testutils/factories/offenderLimitedFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import ViewAppointmentsPage from '../../pages/appointments/viewAppointmentsPage'
import Offender from '../../../server/models/offender'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import Utils from '../../utils'

context('view a session', () => {
  const date = '2025-09-19'
  const projectCode = 'prj'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  // Scenario: navigating through to the view appointments page
  it('allows navigation through to the view appointments page', () => {
    const appointment = appointmentFactory.build({ projectCode, id: 1234 })
    const offender = Utils.stubOffenderFromAppointment(appointment)

    const appointmentSummaryWithOutcome = appointmentSummaryFactory.build({
      projectCode,
      offender,
      id: 1234,
    })

    const session = sessionFactory.build({
      date,
      projectCode,
      appointmentSummaries: [appointmentSummaryWithOutcome],
    })

    cy.task('stubFindSession', { session })

    // Given I am viewing a project session
    const sessionDetailsPage = ViewSessionPage.visitForSearch(session)
    sessionDetailsPage.shouldShowAppointmentsList()

    const request = {
      crn: offender.crn,
      eventNumber: appointment.deliusEventNumber,
    }
    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: [],
    })
    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubFindAppointment', { appointment })

    // When I click an offender's name link
    sessionDetailsPage.clickNameLink(offender)

    // Then I can see the offender's appointments relating to the requirement of that appointment
    Page.verifyOnPage(ViewAppointmentsPage, new Offender(offender))
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
