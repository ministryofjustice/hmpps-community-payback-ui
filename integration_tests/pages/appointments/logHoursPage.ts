import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'
import { pathWithQuery } from '../../../server/utils/utils'

export default class LogHoursPage extends Page {
  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  private startTimeInput = () => this.getTextInputById('startTime')

  private endTimeInput = () => this.getTextInputById('endTime')

  private penaltyHoursInput = () => this.getTextInputById('penaltyTimeHours')

  private penaltyMinutesInput = () => this.getTextInputById('penaltyTimeMinutes')

  static visit(appointment: AppointmentDto): LogHoursPage {
    const path = pathWithQuery(
      paths.appointments.logHours({ projectCode: appointment.projectCode, appointmentId: appointment.id.toString() }),
      {
        form: '123',
      },
    )
    cy.visit(path)

    return new LogHoursPage(appointment)
  }

  enterStartTime(time: string): void {
    this.startTimeInput().clear()
    this.startTimeInput().type(time)
  }

  enterEndTime(time: string): void {
    this.endTimeInput().clear()
    this.endTimeInput().type(time)
  }

  enterPenaltyTime(hours: string, minutes: string): void {
    this.penaltyHoursInput().clear()
    this.penaltyMinutesInput().clear()

    this.penaltyHoursInput().type(hours)
    this.penaltyMinutesInput().type(minutes)
  }

  shouldShowEnteredTimes() {
    this.startTimeInput().should('have.value', '09:00')
    this.endTimeInput().should('have.value', '17:00')
    this.penaltyHoursInput().should('have.value', '1')
    this.penaltyMinutesInput().should('have.value', '00')
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

  shouldNotShowPenaltyHours(): void {
    this.penaltyHoursInput().should('not.exist')
    this.penaltyMinutesInput().should('not.exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Log start and end time')
  }
}
