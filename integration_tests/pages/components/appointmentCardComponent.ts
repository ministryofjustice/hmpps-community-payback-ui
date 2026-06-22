import { AppointmentSummaryDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from './summaryListComponent'

export default class AppointmentCardComponent {
  static shouldShowCardWithDetails(appointment: AppointmentSummaryDto) {
    const card = new SummaryListComponent(DateTimeFormats.isoDateToUIDate(appointment.date))
    card.getValueWithLabel('Project type').should('contain.text', appointment.projectTypeName)
    card.getValueWithLabel('Project', { exact: true }).should('contain.text', appointment.projectName)
    card
      .getValueWithLabel('Time credited')
      .should('contain.text', DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(appointment.minutesCredited))
    card.getValueWithLabel('Outcome').should('contain.text', appointment.contactOutcome.name)
    card.getValueWithLabel('Notes').should('contain.text', appointment.notes)
  }
}
