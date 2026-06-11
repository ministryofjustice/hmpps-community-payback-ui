import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import { contactOutcomeFactory } from '../../../../server/testutils/factories/contactOutcomeFactory'
import LogCompliancePage from '../../../pages/appointments/logCompliancePage'

context('Group Session Bulk Update - Log Hours', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const session = sessionFactory.build({ projectCode: project.projectCode })
    cy.wrap(session).as('session')
  })

  beforeEach(function test() {
    cy.task('stubFindProject', { project: this.project })
    cy.task('stubFindSession', { session: this.session })
    cy.task(
      'stubGetAppointmentForm',
      appointmentOutcomeFormFactory.build({ contactOutcome: contactOutcomeFactory.build({ attended: true }) }),
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

  // Scenario: can complete the form and navigate to the next page
  describe('submit', function describe() {
    it('submits the form and navigates to the next page', function test() {
      const page = LogHoursPage.visitForSession(this.session)

      page.enterStartTime('09:00')
      page.enterEndTime('17:00')
      page.enterPenaltyTime('1', '00')

      cy.task('stubSaveAppointmentForm')
      page.clickSubmit()

      Page.verifyOnPage(LogCompliancePage, this.session)
    })
  })
})
