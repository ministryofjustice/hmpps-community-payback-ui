import { AppointmentSummaryDto } from '../@types/shared'
import { AppointmentCard } from '../@types/user-defined'
import DateTimeFormats from './dateTimeUtils'

export default class AppointmentUtils {
  static appointmentCard(appointment: AppointmentSummaryDto): AppointmentCard {
    const timeCreditedObj = DateTimeFormats.totalMinutesToHoursAndMinutesNumberParts(appointment.completedMinutes)

    return {
      date: appointment.date ? DateTimeFormats.isoDateToUIDate(appointment.date) : undefined,
      timeCredited: DateTimeFormats.hoursAndMinutesToHumanReadable(timeCreditedObj.hours, timeCreditedObj.minutes),
      outcome: appointment.contactOutcome.name,
    }
  }
}
