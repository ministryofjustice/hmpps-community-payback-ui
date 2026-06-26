import { AppointmentOrSession } from '../../../server/@types/user-defined'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class LogHoursPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'log-hours'

  constructor(appointmentOrSession: AppointmentOrSession) {
    super(appointmentOrSession)
  }

  private startTimeInput = () => this.getTextInputById('startTime')

  private endTimeInput = () => this.getTextInputById('endTime')

  enterStartTime(time: string): void {
    this.startTimeInput().clear()
    this.startTimeInput().type(time)
  }

  enterEndTime(time: string): void {
    this.endTimeInput().clear()
    this.endTimeInput().type(time)
  }

  shouldShowEnteredTimes(
    args: { startTime: string; endTime: string } = {
      startTime: '09:00',
      endTime: '17:00',
    },
  ) {
    this.startTimeInput().should('have.value', args.startTime)
    this.endTimeInput().should('have.value', args.endTime)
  }

  shouldShowReadOnlyStartAndEndTimes(startTime: string, endTime: string): void {
    this.startTimeInput().should('not.exist')
    this.endTimeInput().should('not.exist')

    cy.get('input[type="hidden"][name="startTime"]').should('have.value', startTime)
    cy.get('input[type="hidden"][name="endTime"]').should('have.value', endTime)

    cy.contains('Start time').should('exist')
    cy.contains('End time').should('exist')
    cy.get('p').contains(startTime).should('exist')
    cy.get('p').contains(endTime).should('exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Log start and end time')
  }
}
