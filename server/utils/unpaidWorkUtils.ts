import { UnpaidWorkDetailsDto } from '../@types/shared'
import DateTimeFormats from './dateTimeUtils'

export interface UnpaidWorkHoursDetails {
  totalHoursOrdered: string
  maximumEteHours: string
  eteHoursCredited: string
  eteHoursRemaining: string
  totalHoursRemaining?: string
}

export default class UnpaidWorkUtils {
  static unpaidWorkHoursDetails(
    detail: UnpaidWorkDetailsDto,
    includeTotalHoursRemaining = false,
  ): UnpaidWorkHoursDetails {
    const totalHoursOrdered = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.requiredMinutes)
    const eteHoursCredited = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.completedEteMinutes)
    const eteHoursRemaining = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.remainingEteMinutes)
    const maximumEteHours = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.allowedEteMinutes)

    return {
      totalHoursOrdered,
      maximumEteHours,
      eteHoursCredited,
      eteHoursRemaining,
      totalHoursRemaining: includeTotalHoursRemaining ? UnpaidWorkUtils.totalHoursRemaining(detail) : undefined,
    }
  }

  static getUnpaidWorkOptions(unpaidWorkDetails: Array<UnpaidWorkDetailsDto>, selectedOptionValue?: number) {
    return unpaidWorkDetails.map(detail => {
      const text = detail.mainOffence.description
      const value = detail.eventNumber

      const { totalHoursOrdered, eteHoursCredited, eteHoursRemaining } = UnpaidWorkUtils.unpaidWorkHoursDetails(detail)

      const details = {
        'Event number': value.toString(),
        'Sentence date': DateTimeFormats.isoDateToUIDate(detail.sentenceDate),
        Status: detail.upwStatus,
        'Total hours ordered': totalHoursOrdered,
        'ETE hours credited': eteHoursCredited,
        'ETE hours remaining': eteHoursRemaining,
      }

      const checked = detail.eventNumber === selectedOptionValue

      return { text, value, details: this.buildDetailsRows(details), checked }
    })
  }

  private static buildDetailsRows(details: Record<string, string>) {
    return Object.entries(details).map(([key, value]) => {
      return {
        key: {
          text: key,
        },
        value: {
          text: value,
        },
      }
    })
  }

  private static totalHoursRemaining(detail: UnpaidWorkDetailsDto) {
    return DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.requiredMinutes - detail.completedMinutes)
  }
}
