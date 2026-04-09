import { AppointmentDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import Page from '../page'

export default class UpdateTravelTimePage extends Page {
  readonly timeInput = new HoursMinutesInputComponent()

  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): UpdateTravelTimePage {
    const path = paths.appointments.travelTime.update({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
      taskId: '1',
    })

    cy.visit(path)

    return new UpdateTravelTimePage(appointment)
  }

  override shouldShowErrorSummary(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }
}
