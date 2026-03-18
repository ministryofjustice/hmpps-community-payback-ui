import { AppointmentSummaryDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from './summaryListComponent'

export default class AppointmentCardComponent {
  static shouldShowCardWithDetails(appointment: AppointmentSummaryDto) {
    const card = new SummaryListComponent(DateTimeFormats.isoDateToUIDate(appointment.date))
    const timeCreditedObj = DateTimeFormats.totalMinutesToHoursAndMinutesNumberParts(appointment.minutesCredited)
    card.getValueWithLabel('Project type').should('contain.text', appointment.projectTypeName)

    // Provide an exact matcher as otherwise it always returns a partial match on the row above
    card.getValueWithLabel(/^ Project $/).should('contain.text', appointment.projectName)
    card
      .getValueWithLabel('Time credited')
      .should(
        'contain.text',
        DateTimeFormats.hoursAndMinutesToHumanReadable(timeCreditedObj.hours, timeCreditedObj.minutes),
      )
    card.getValueWithLabel('Outcome').should('contain.text', appointment.contactOutcome.name)
    card.getValueWithLabel('Notes').should('contain.text', appointment.notes)
  }
}
