import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'
import BulkUpdatePage from '../../../pages/appointments/bulkUpdatePage'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'

context('Group Session Bulk Update - Log Compliance', () => {
  const attendanceData = {
    hiVisWorn: null,
    workedIntensively: null,
    workQuality: null,
    behaviour: null,
  }
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const selectedAppointments = appointmentSummaryFactory.buildList(2)
    cy.wrap(selectedAppointments).as('selectedAppointments')
    const unselectedAppointment = appointmentSummaryFactory.build()
    cy.wrap(unselectedAppointment).as('unselectedAppointment')
    const session = sessionFactory.build({
      projectCode: project.projectCode,
      appointmentSummaries: [...selectedAppointments, unselectedAppointment],
    })
    cy.wrap(session).as('session')

    cy.task('stubFindProject', { project })
    cy.task('stubFindSession', { session })
    cy.task(
      'stubGetAppointmentForm',
      appointmentOutcomeFormFactory.build({
        attendanceData,
        appointments: selectedAppointments.map(appointment => ({ id: appointment.id, deliusVersion: '' })),
      }),
    )
  })

  // Scenario: sees validation errors with any entered answers when form is not valid
  it('validates form data', function test() {
    const page = LogCompliancePage.visitForSession(this.session)
    page.clickSubmit()

    page.shouldShowErrorSummary('hiVis', 'Select whether a Hi-Vis was worn')
    page.shouldShowErrorSummary('workedIntensively', 'Select whether they worked intensively')
    page.shouldShowErrorSummary('workQuality', 'Select their work quality')
    page.shouldShowErrorSummary('behaviour', 'Select their behaviour')
    page.shouldNotHaveAnySelectedValues()
  })

  // Scenario: can navigate back to the previous page
  it('navigates back to the previous page', function test() {
    const page = LogCompliancePage.visitForSession(this.session)
    page.clickBack()

    Page.verifyOnPage(LogHoursPage, this.session)
  })

  // Scenario: can view and change people selected on the bulk update
  it('enables navigation back to change selected people', function test() {
    const page = LogCompliancePage.visitForSession(this.session)
    page.selectedPeopleCard.shouldShowSelectedPeople(this.selectedAppointments)
    page.selectedPeopleCard.shouldNotShowPeople([this.unselectedAppointment])
    cy.task('stubSaveAppointmentForm')

    page.selectedPeopleCard.clickChangeLink()

    Page.verifyOnPage(BulkUpdatePage, this.session)
  })

  // Scenario: can complete the form and navigate to the next page
  describe('submit', function describe() {
    it('submits the form and navigates to the next page', function test() {
      const page = LogCompliancePage.visitForSession(this.session)

      page.completeForm()

      cy.task('stubSaveAppointmentForm')

      page.clickSubmit()

      Page.verifyOnPage(ConfirmDetailsPage, this.session)
    })
  })
})
