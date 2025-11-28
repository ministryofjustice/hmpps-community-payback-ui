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

  enterPenaltyTime(time: string): void {
    this.getTextInputById('penaltyHours').clear()
    this.getTextInputByIdAndEnterDetails('penaltyHours', time)
  }

  shouldNotShowPenaltyHours(): void {
    this.getTextInputById('penaltyHours').should('not.exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Log start and end time')
  }
}
