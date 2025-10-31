//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Confirming an appointment update
//    Given I am on the confirm page of an in progress update
//    Then I can see my completed answers

//  Scenario: Confirming an appointment update without enforcement
//    Given I am on the confirm page of an in progress update without enforcement
//    Then I can see my completed answers without enforcement

// Scenario: navigating back from confirm - not enforceable
//    Given I am on the confirm page of an in progress update without enforcement
//    And I click back
//    Then I can see the log compliance questions

// Scenario: navigating back from confirm - enforceable
//    Given I am on the confirm page of an in progress update with enforcement
//    And I click back
//    Then I can see the enforcement questions

import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory, {
  enforcementOutcomeFormFactory,
} from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../../server/testutils/factories/attendanceDataFactory'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import Page from '../../pages/page'

context('Confirm appointment details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const appointment = appointmentFactory.build({ id: 1001 })
    cy.wrap(appointment).as('appointment')
  })

  // Scenario: Confirming an appointment update
  it('shows my completed answers for the current form', function test() {
    const form = appointmentOutcomeFormFactory.build({
      startTime: '09:00',
      endTime: '16:00',
      attendanceData: attendanceDataFactory.build({
        penaltyTime: '01:00',
        workedIntensively: false,
      }),
      contactOutcome: contactOutcomeFactory.build({
        enforceable: true,
      }),
      enforcement: enforcementOutcomeFormFactory.build(),
    })

    // Given I am on the confirm page of an in progress update
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails()
    page.shouldShowEnforcementDetails()
  })

  // Scenario: Confirming an appointment update without enforcement
  it('shows my completed answers for the current form without enforcement', function test() {
    const form = appointmentOutcomeFormFactory.build({
      startTime: '09:00',
      endTime: '16:00',
      attendanceData: attendanceDataFactory.build({
        penaltyTime: '01:00',
        workedIntensively: false,
      }),
      enforcement: undefined,
      contactOutcome: contactOutcomeFactory.build({
        enforceable: undefined,
      }),
    })

    // Given I am on the confirm page of an in progress update without enforcement
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my submitted answers without enforcement
    page.shouldShowCompletedDetails()
    page.shouldNotShowEnforcementDetails()
  })

  // Scenario: navigating back from confirm - not enforceable
  describe('navigating back', function describe() {
    it('returns to compliance page if contact outcome is not enforceable', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          enforceable: false,
        }),
      })

      // Given I am on the confirm page of an in progress update without enforcement
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click back
      page.clickBack()

      // Then I can see the log compliance questions
      const compliancePage = Page.verifyOnPage(LogCompliancePage, this.appointment)
      compliancePage.shouldShowQuestions()
    })

    // Scenario: navigating back from confirm - enforceable
    it('returns to enforcement page if contact outcome is enforceable', function test() {
      const form = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({
          enforceable: true,
        }),
      })

      // Given I am on the confirm page of an in progress update with enforcement
      cy.task('stubFindAppointment', { appointment: this.appointment })
      cy.task('stubGetForm', form)

      const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
      page.checkOnPage()

      // And I click back
      page.clickBack()

      // Then I can see the enforcement questions
      const enforcementPage = Page.verifyOnPage(EnforcementPage, this.appointment)
      enforcementPage.shouldShowQuestions()
    })
  })
})
