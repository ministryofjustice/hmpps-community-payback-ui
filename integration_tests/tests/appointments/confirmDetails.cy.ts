//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Confirming an appointment update
//    Given I am on the confirm page of an in progress update
//    Then I can see my completed answers

import { AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../../server/testutils/factories/appointmentOutcomeFormFactory'
import attendanceDataFactory from '../../../server/testutils/factories/attendanceDataFactory'
import { contactOutcomeFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import ConfirmDetailsPage from '../../pages/appointments/confirmDetailsPage'

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
    const form: AppointmentOutcomeForm = appointmentOutcomeFormFactory.build({
      startTime: '09:00',
      endTime: '16:00',
      attendanceData: attendanceDataFactory.build({
        penaltyTime: '01:00',
        workedIntensively: false,
      }),
      contactOutcome: contactOutcomeFactory.build({
        enforceable: false,
      }),
    })

    // Given I am on the confirm page of an in progress update
    cy.task('stubFindAppointment', { appointment: this.appointment })
    cy.task('stubGetForm', form)

    const page = ConfirmDetailsPage.visit(this.appointment, form, '1')
    page.checkOnPage()

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails()
  })
})
