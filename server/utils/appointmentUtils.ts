import { AppointmentSummaryDto } from '../@types/shared'
import { SummaryCard } from '../@types/user-defined'
import DateTimeFormats from './dateTimeUtils'

export default class AppointmentUtils {
  static appointmentCard(appointment: AppointmentSummaryDto): SummaryCard {
    const timeCreditedText = AppointmentUtils.timeCreditedText(appointment)

    return {
      title: appointment.date ? DateTimeFormats.isoDateToUIDate(appointment.date) : 'Appointment details',
      rows: [
        {
          key: {
            text: 'Project type',
          },
          value: {
            text: appointment.projectTypeName,
          },
        },
        {
          key: {
            text: 'Project',
          },
          value: {
            text: appointment.projectName,
          },
        },
        {
          key: {
            text: 'Time credited',
          },
          value: {
            text: timeCreditedText,
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
        {
          key: {
            text: 'Notes',
          },
          value: {
            text: appointment.notes,
          },
        },
      ],
    }
  }

  private static timeCreditedText(appointment: AppointmentSummaryDto): string {
    if (appointment.minutesCredited === null || appointment.minutesCredited === undefined) {
      return ''
    }

    const timeCreditedObj = DateTimeFormats.totalMinutesToHoursAndMinutesNumberParts(appointment.minutesCredited)
    const timeCreditedText = DateTimeFormats.hoursAndMinutesToHumanReadable(
      timeCreditedObj.hours,
      timeCreditedObj.minutes,
    )
    return timeCreditedText
  }
}
