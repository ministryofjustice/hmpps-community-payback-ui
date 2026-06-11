import LogCompliancePage from '../../../pages/appointments/logCompliancePage'
import LogHoursPage from '../../../pages/appointments/logHoursPage'
import Page from '../../../pages/page'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import appointmentOutcomeFormFactory from '../../../../server/testutils/factories/appointmentOutcomeFormFactory'
import ConfirmDetailsPage from '../../../pages/appointments/confirmDetailsPage'

context('Group Session Bulk Update - Log Compliance', () => {
  const form = appointmentOutcomeFormFactory.build({
    attendanceData: {
      hiVisWorn: null,
      workedIntensively: null,
      workQuality: null,
      behaviour: null,
    },
  })
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
    cy.task('stubGetAppointmentForm', form)
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
