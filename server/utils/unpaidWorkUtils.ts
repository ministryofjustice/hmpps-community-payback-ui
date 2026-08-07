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

  static unpaidWorkSummaryItem(unpaidWorkDetails: UnpaidWorkDetailsDto | undefined, changePath: string) {
    const requirementDetails = unpaidWorkDetails ? UnpaidWorkUtils.summaryString(unpaidWorkDetails) : undefined

    return {
      key: {
        text: 'Requirement',
      },
      value: {
        html: requirementDetails,
      },
      actions: {
        items: [
          {
            href: changePath,
            text: 'Change',
            visuallyHiddenText: 'requirement',
          },
        ],
      },
    }
  }

  private static summaryString(unpaidWorkDetails: UnpaidWorkDetailsDto) {
    return [
      `Offence: ${unpaidWorkDetails.mainOffence.description}`,
      `Event number: ${unpaidWorkDetails.eventNumber}`,
      `Sentence date: ${DateTimeFormats.isoDateToUIDate(unpaidWorkDetails.sentenceDate)}`,
      `Status: ${unpaidWorkDetails.upwStatus}`,
    ].join('<br>')
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
