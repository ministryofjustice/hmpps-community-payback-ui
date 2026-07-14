import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import { updateSessionFormFactory } from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import { contactOutcomeFactory } from '../../../../server/testutils/factories/contactOutcomeFactory'
import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import BulkUpdatePage from '../../../pages/appointments/bulkUpdatePage'
import appointmentFactory from '../../../../server/testutils/factories/appointmentFactory'

context('Group Session Bulk Update - Log Hours', () => {
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
  })

  beforeEach(function test() {
    cy.task('stubFindProject', { project: this.project })
    cy.task('stubFindSession', { session: this.session })
    cy.task(
      'stubGetAppointmentForm',
      updateSessionFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        appointments: this.selectedAppointments.map(appointment => ({ id: appointment.id, deliusVersion: '' })),
      }),
    )
  })

  // Scenario: sees validation errors with any entered answers when form is not valid
  it('validates form data', function test() {
    const page = LogHoursPage.visitForSession(this.session)
    page.enterStartTime('0')
    page.enterEndTime('1')

    // When I submit the form
    page.clickSubmit()

    // Then I see the log hours page with errors
    page.shouldShowErrorSummary('startTime', 'Enter a valid start time, for example 09:00')
    page.shouldShowErrorSummary('endTime', 'Enter a valid end time, for example 17:00')

    page.shouldShowEnteredTimes({ startTime: '0', endTime: '1' })
  })

  // Scenario: can navigate back to the previous page
  it('navigates back to the previous page', function test() {
    const page = LogHoursPage.visitForSession(this.session)
    cy.task('stubGetContactOutcomes', { contactOutcomes: { contactOutcomes: contactOutcomeFactory.buildList(2) } })
    page.clickBack()

    Page.verifyOnPage(AttendanceOutcomePage, this.session)
  })

  // Scenario: can view and change people selected on the bulk update
  it('enables navigation back to change selected people', function test() {
    const page = LogCompliancePage.visitForSession(this.session)
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
      const page = LogHoursPage.visitForSession(this.session)

      page.enterStartTime('09:00')
      page.enterEndTime('17:00')

      cy.task('stubSaveAppointmentForm')
      page.clickSubmit()

      Page.verifyOnPage(LogCompliancePage, this.session)
    })
  })
})
