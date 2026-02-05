import { AppointmentSummaryDto } from '../@types/shared'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'

export default class ProjectPage {
  static appointmentList(appointments: Array<AppointmentSummaryDto>) {
    return appointments.map(appointment => {
      const offender = new Offender(appointment.offender)
      return [
        { html: offender.getTableHtml() },
        {
          text: DateTimeFormats.isoDateToUIDate(appointment.date, { format: 'medium' }),
          attributes: {
            'data-sort-value': DateTimeFormats.isoToMilliseconds(appointment.date),
          },
        },
        {
          text: DateTimeFormats.stripTime(appointment.startTime),
        },
        {
          text: DateTimeFormats.stripTime(appointment.endTime),
        },
        { text: appointment.daysOverdue },
      ]
    })
  }
}
