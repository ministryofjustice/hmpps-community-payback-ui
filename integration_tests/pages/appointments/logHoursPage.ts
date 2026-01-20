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
    this.getTextInputById('startTime').clear()
    this.getTextInputByIdAndEnterDetails('startTime', time)
  }

  enterEndTime(time: string): void {
    this.getTextInputById('endTime').clear()
    this.getTextInputByIdAndEnterDetails('endTime', time)
  }

  enterPenaltyTime(hours: string, minutes: string): void {
    this.getTextInputById('penaltyTimeHours').clear()
    this.getTextInputById('penaltyTimeMinutes').clear()

    this.getTextInputByIdAndEnterDetails('penaltyTimeHours', hours)
    this.getTextInputByIdAndEnterDetails('penaltyTimeMinutes', minutes)
  }

  shouldShowReadOnlyStartAndEndTimes(startTime: string, endTime: string): void {
    this.getTextInputById('startTime').should('not.exist')
    this.getTextInputById('endTime').should('not.exist')

    cy.get('input[type="hidden"][name="startTime"]').should('have.value', startTime)
    cy.get('input[type="hidden"][name="endTime"]').should('have.value', endTime)

    cy.contains('Start time').should('exist')
    cy.contains('End time').should('exist')
    cy.get('p').contains(startTime).should('exist')
    cy.get('p').contains(endTime).should('exist')
  }

  shouldNotShowPenaltyHours(): void {
    this.getTextInputById('penaltyTimeHours').should('not.exist')
    this.getTextInputById('penaltyTimeMinutes').should('not.exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Log start and end time')
  }
}
