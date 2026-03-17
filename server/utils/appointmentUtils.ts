import { AppointmentSummaryDto } from '../@types/shared'
import { SummaryCard } from '../@types/user-defined'
import DateTimeFormats from './dateTimeUtils'

export default class AppointmentUtils {
  static appointmentCard(appointment: AppointmentSummaryDto): SummaryCard {
    const timeCreditedObj = DateTimeFormats.totalMinutesToHoursAndMinutesNumberParts(appointment.completedMinutes)

    return {
      title: appointment.date ? DateTimeFormats.isoDateToUIDate(appointment.date) : 'Appointment details',
      rows: [
        {
          key: {
            text: 'Time credited',
          },
          value: {
            text: DateTimeFormats.hoursAndMinutesToHumanReadable(timeCreditedObj.hours, timeCreditedObj.minutes),
          },
        },
        {
          key: {
            text: 'Outcome',
          },
          value: {
            text: appointment.contactOutcome?.name || 'Not entered',
          },
        },
      ],
    }
  }
}
