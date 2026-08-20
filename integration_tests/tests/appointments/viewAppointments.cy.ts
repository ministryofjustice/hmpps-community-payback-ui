import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import appointmentSummaryFactory from '../../../server/testutils/factories/appointmentSummaryFactory'
import caseDetailsSummaryFactory from '../../../server/testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../../../server/testutils/factories/offenderFullFactory'
import offenderLimitedFactory from '../../../server/testutils/factories/offenderLimitedFactory'
import pagedMetadataFactory from '../../../server/testutils/factories/pagedMetadataFactory'
import pagedModelAppointmentSummaryFactory from '../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import unpaidWorkDetailsFactory from '../../../server/testutils/factories/unpaidWorkDetailsFactory'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import ViewAppointmentsPage from '../../pages/appointments/viewAppointmentsPage'
import FindAPersonPage from '../../pages/findAPersonPage'
import Page from '../../pages/page'
import RequirementPage from '../../pages/requirementPage'
import RestrictedPersonPage from '../../pages/restrictedPersonPage'

// Feature: View appointments
//   As a case administrator
//   I want to be able to view appointments for an offender
//   So that I can track progress for an unpaid work order

// Scenario: rendering appointments when there is only one requirement
//   Given I am on the view appointments page
//   And the offender only has one requirement
//   Then I should see no change requirement link
//   And when I click back
//   Then I should see the Find A Person page

// Scenario: rendering appointments when there are multiple requirements
//   Given I am on the view appointments page
//   And the offender has multiple requirement
//   Then I should see a change requirement link
//   And when I click back
//   Then I should see the Requirement page

// Scenario: showing a notification badge indicating missing outcomes
//   Given I am on the view appointments page
//   And the offender has missing outcomes
//   Then I should see a notification badge with an appropriate number of missing outcomes

// Scenario: showing an empty message if there are no appointments
//   Given I am on the view appointments page
//   And the offender has no appointments in that tab section
//   Then I should see a message with appropriate wording

// Scenario: moving to another tab
//   Given I am on the view appointments page
//   And I want to see past appointments
//   Then I can navigate to that tab
//   And I should see the appropriate appointments

// Scenario: viewing an appointment from the list
//   Given I am on the view appointments page
//   And I click View on an appointment row in the table
//   Then I should be taken to the check appointment details page for that appointment

// Scenario: viewing the view appointments page for a limited offender
//   Given the offender is limited
//   When I attempt to visit the view appointments page
//   Then I should see the restricted person page

context('View appointments page', () => {
  const crn = 'X11111'

  const offender = offenderFullFactory.build({ crn })
  const sortedAppointments = appointmentSummaryFactory
    .buildList(10)
    .sort((a, b) => DateTimeFormats.isoToMilliseconds(b.date) - DateTimeFormats.isoToMilliseconds(a.date))

  sortedAppointments[0].offender.crn = crn

  const request = {
    crn,
    eventNumber: '1',
    fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
  }

  const noOutcomeRequest = {
    crn,
    outcomeCodes: ['NO_OUTCOME'],
    eventNumber: '1',
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  // Scenario: rendering appointments when there is only one requirement
  it('renders a list of appointments when there is one requirement', () => {
    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails], // one requirement
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: sortedAppointments,
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // Given I am on the view appointments page

    // And the offender only has one requirement
    const page = ViewAppointmentsPage.visit(offender, '1', 'upcoming')
    page.shouldShowAppointmentsList(sortedAppointments)

    // Then I should see no change requirement link
    page.shouldHaveNoChangeLink()

    // And when I click back
    page.clickBack()

    // Then I should see the Find A Person page
    Page.verifyOnPage(FindAPersonPage)
  })

  // Scenario: rendering appointments when there are multiple requirements
  it('renders a list of appointments when there are multiple requirements', () => {
    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()], // many requirements
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: sortedAppointments,
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // Given I am on the view appointments page
    // And the offender has multiple requirement
    const page = ViewAppointmentsPage.visit(offender, '1', 'upcoming')
    page.shouldShowAppointmentsList(sortedAppointments)
    // Then I should see a change requirement link
    page.shouldHaveChangeLink()

    // And when I click back
    page.clickBack()

    // Then I should see the Requirement page
    Page.verifyOnPage(RequirementPage, new Offender(offender).name)
  })

  // Scenario: showing a notification badge indicating missing outcomes
  it('renders a notification badge when there are missing outcomes', () => {
    const notificationCount = 5

    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 2 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: sortedAppointments,
      page: pagedMetadataFactory.build({ totalElements: notificationCount }),
    })

    const req = {
      crn,
      eventNumber: '2',
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    }

    const noOutcomeReq = {
      crn,
      outcomeCodes: ['NO_OUTCOME'],
      eventNumber: '2',
    }

    cy.task('stubGetAppointments', { request: req, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeReq, pagedAppointments })

    // Given I am on the view appointments page
    // And the offender has missing outcomes
    const page = ViewAppointmentsPage.visit(offender, '2', 'upcoming')
    page.shouldShowAppointmentsList(sortedAppointments)

    // Then I should see a notification badge with an appropriate number of missing outcomes
    page.shouldHaveNotificationBadgeWithCount(notificationCount)
  })

  // Scenario: showing an empty message if there are no appointments
  it('shows an empty message if there are no appointments', () => {
    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: [], // no appointments
      page: pagedMetadataFactory.build({ totalElements: 0 }),
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // Given I am on the view appointments page
    // And the offender has no appointments in that tab section
    const page = ViewAppointmentsPage.visit(offender, '1', 'upcoming')

    // Then I should see a message with appropriate wording
    page.shouldShowAlertMessageWithText('This person has no upcoming appointments')
  })

  // Scenario: moving to another tab
  it('navigates correctly to a different tab', () => {
    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: sortedAppointments,
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // Given I am on the view appointments page
    const page = ViewAppointmentsPage.visit(offender, '1', 'upcoming')

    // And I want to see past appointments
    const pastAppointments = appointmentSummaryFactory.buildList(1)
    const now = new Date()
    const yesterday = DateTimeFormats.dateObjToIsoString(new Date(now.setDate(now.getDate() - 1)))

    cy.task('stubGetAppointments', {
      request: {
        crn,
        eventNumber: '1',
        toDate: yesterday,
      },
      pagedAppointments: pagedModelAppointmentSummaryFactory.build({
        content: pastAppointments,
      }),
    })

    // Then I can navigate to that tab
    page.clickPastAppointmentsTab()

    // And I should see the appropriate appointments
    page.shouldShowAppointmentsList(pastAppointments)
  })

  // Scenario: viewing an appointment from the list
  it('allows an appointment to be viewed', () => {
    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: sortedAppointments,
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // Given I am on the view appointments page
    const page = ViewAppointmentsPage.visit(offender, '1', 'upcoming')
    page.shouldShowAppointmentsList(sortedAppointments)
    page.shouldHaveChangeLink()

    const appointment = sortedAppointments[0]

    const project = projectFactory.build({
      projectCode: appointment.projectCode,
      projectName: appointment.projectName,
    })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubFindProject', { project })
    cy.task('stubFindAppointment', { appointment })

    // And I click View on an appointment row in the table
    page.clickViewFirstAppointment()

    // Then I should be taken to the check appointment details page for that appointment
    Page.verifyOnPage(CheckAppointmentDetailsPage, appointment)
  })

  it('renders the restricted person page if the offender is limited', () => {
    // Given the offender is limited
    const limitedOffender = offenderLimitedFactory.build()
    const upwDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender: limitedOffender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const pagedAppointments = pagedModelAppointmentSummaryFactory.build({
      content: sortedAppointments,
    })

    cy.task('stubGetAppointments', { request, pagedAppointments })
    cy.task('stubGetAppointments', { request: noOutcomeRequest, pagedAppointments })

    // When I attempt to visit the view appointments page
    const path = paths.people.appointments({
      crn: limitedOffender.crn,
      deliusEventNumber: '1',
      appointmentSection: 'upcoming',
    })
    cy.visit(path)

    // Then I should see the restricted person page
    Page.verifyOnPage(RestrictedPersonPage, limitedOffender.crn)
  })
})
