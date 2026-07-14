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

      const hintHtml = [
        `Event number: ${detail.eventNumber}`,
        `Sentence date: ${DateTimeFormats.isoDateToUIDate(detail.sentenceDate)}`,
        `Total hours ordered: ${totalHoursOrdered}`,
        `ETE hours credited: ${eteHoursCredited}`,
        `ETE hours remaining: ${eteHoursRemaining}`,
        `Status: ${detail.upwStatus}`,
      ].join('<br>')

      const checked = detail.eventNumber === selectedOptionValue

      return { text, value, hint: { html: hintHtml }, checked }
    })
  }

  private static totalHoursRemaining(detail: UnpaidWorkDetailsDto) {
    return DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.requiredMinutes - detail.completedMinutes)
  }
}
