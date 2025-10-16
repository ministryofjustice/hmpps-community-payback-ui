//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Accessing the update appointment form
//    Given I am on a session details page
//    When I click update next for a particular session
//    Then I see the check project details page

//  Scenario: Viewing a session with Limited Access Offenders
//    Given I am viewing a session details page with limited access offenders
//    Then I see limited offender details and no option to update

// Scenario: Returning to a session page
//    Given I am on an appointment 'check your details' page
//    When I click back
//    Then I see the details of the session for that appointment

// Scenario: Supervisor for an appointment has no previously saved value
//    Given I am on an appointment 'check project details' page
//    Then I see a blank supervisor input

// Scenario: Supervisor for an appointment has a previously saved value
//    Given I am on an appointment 'check your details' page
//    Then I see a supervisor input with a saved value

import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import Page from '../../pages/page'
import ViewSessionPage from '../../pages/viewSessionPage'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../../server/testutils/factories/supervisorSummaryFactory'

context('Session details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  //  Scenario: Accessing the update appointment form
  it('shows an option to update an appointment on a session', () => {
    // Given I am on the view session page
    cy.task('stubFindSession', {})
    const page = ViewSessionPage.visit()
    page.shouldShowAppointmentsList()

    // When I click update for a particular session
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    cy.task('stubGetSupervisors')
    page.clickUpdateAnAppointment()

    // Then I see the check project details page
    const checkProjectDetailsPage = Page.verifyOnPage(CheckProjectDetailsPage)
    checkProjectDetailsPage.shouldContainProjectDetails()
  })

  //  Scenario: Viewing a session with Limited Access Offenders
  it('does not enable appointment update for a limited access offender', () => {
    // Given I am on the view session page

    cy.task('stubFindSession', { responseHasLimitedOffenders: true })
    const page = ViewSessionPage.visit()

    // Then I see limited information about offenders and cannot update
    page.shouldShowOffendersWithNoNames()
    page.shouldNotHaveUpdateLinksForOffenders()
  })

  // Scenario: Returning to a session page
  it('enables navigation back to session page', () => {
    cy.task('stubFindAppointment')
    cy.task('stubGetSupervisors')

    // Given I am on an appointment 'check your details' page
    const page = CheckProjectDetailsPage.visit()

    // When I click back
    cy.task('stubFindSession', { projectCode: 'XCT12', date: '2025-01-02' })
    page.clickBack()

    // Then I see the details of the session for that appointment
    Page.verifyOnPage(ViewSessionPage)
  })

  describe('Supervisor input', () => {
    // Scenario: Supervisor for an appointment has no previously saved value
    it('should not have a selected supervisor if no supervisor on attendance data', () => {
      const appointment = appointmentFactory.build({ attendanceData: undefined })
      const supervisors = supervisorSummaryFactory.buildList(2)

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      // Given I am on an appointment 'check project details' page
      const page = CheckProjectDetailsPage.visit(appointment)

      // Then I see a blank supervisor input
      page.supervisorInput.shouldNotHaveAValue()
    })

    // Scenario: Supervisor for an appointment has a previously saved value
    it('should show any existing value for supervisor in the form', () => {
      const appointment = appointmentFactory.build()
      const supervisors = [
        supervisorSummaryFactory.build(),
        supervisorSummaryFactory.build({ code: appointment.attendanceData.supervisorOfficerCode }),
      ]

      cy.task('stubFindAppointment', { appointment })
      cy.task('stubGetSupervisors', {
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        supervisors,
      })

      // Given I am on an appointment 'check your details' page
      const page = CheckProjectDetailsPage.visit(appointment)

      // Then I see a supervisor input with a saved value
      page.supervisorInput.shouldHaveValue(appointment.attendanceData.supervisorOfficerCode)
    })
  })
})
