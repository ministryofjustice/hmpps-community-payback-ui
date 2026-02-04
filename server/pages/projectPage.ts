import Offender from '../models/offender'
import { ProjectAppointmentSummaryDto } from '../testutils/factories/projectAppointmentSummaryFactory'
import DateTimeFormats from '../utils/dateTimeUtils'

export default class ProjectPage {
  static appointmentList(appointments: Array<ProjectAppointmentSummaryDto>) {
    return appointments.map(appointment => {
      const offender = new Offender(appointment.offender)
      return [
        { html: offender.getTableHtml() },
        { text: DateTimeFormats.isoDateToUIDate(appointment.date, { format: 'medium' }) },
        { text: DateTimeFormats.stripTime(appointment.startTime) },
        { text: DateTimeFormats.stripTime(appointment.endTime) },
        { text: appointment.daysOverdue },
      ]
    })
  }
}
