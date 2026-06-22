import { AppointmentSummaryDto, AttendanceDataDto, ContactOutcomeDto } from '../@types/shared'
import { GovUkStatusTagColour, SummaryCard } from '../@types/user-defined'
import DateTimeFormats from './dateTimeUtils'
import { properCase } from './utils'

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
            html: AppointmentUtils.formatNotesAsHtml(appointment.notes),
          },
        },
      ],
    }
  }

  static formatNotesAsHtml(notes?: string): string | undefined {
    return notes?.split('\n').join('<br/>')
  }

  static formatComplianceRatings(
    rating?: AttendanceDataDto['workQuality'] | AttendanceDataDto['behaviour'],
  ): string | undefined {
    if (!rating) {
      return undefined
    }
    const ratingWithProperCasing = properCase(rating)
    const ratingSubstrings = ratingWithProperCasing.split('_')
    return ratingSubstrings.length > 1 ? `${ratingSubstrings[0]} ${ratingSubstrings[1]}` : ratingSubstrings[0]
  }

  static getStatusColour(contactOutcome: ContactOutcomeDto): GovUkStatusTagColour {
    // Attended & complied or acceptable absence
    if (!contactOutcome.enforceable) {
      return 'teal'
    }

    // Attended & did not comply
    if (contactOutcome.attended) {
      return 'yellow'
    }

    // Unexpected absence
    return 'red'
  }

  private static timeCreditedText(appointment: AppointmentSummaryDto): string {
    if (appointment.minutesCredited === null || appointment.minutesCredited === undefined) {
      return ''
    }

    const timeCreditedText = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(appointment.minutesCredited)
    return timeCreditedText
  }
}
