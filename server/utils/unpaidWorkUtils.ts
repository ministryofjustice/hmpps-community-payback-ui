import { CommonUnpaidWorkDetailsDto } from '../@types/shared'
import { UnpaidWorkDetailsDtoWithCount } from '../@types/user-defined'
import { CourseCompletionForm } from '../services/forms/courseCompletionFormService'
import DateTimeFormats from './dateTimeUtils'

export interface UnpaidWorkHoursDetails {
  totalHoursOrdered: string
  maximumEteHours: string
  eteHoursCredited: string
  eteHoursRemaining: string
  totalHoursRemaining: string
  totalHoursCompleted: string
}

export interface OtherUnpaidWorkRequirementsSummary {
  count: number
  totalMinutes: number
  humanReadableTotalHours: string
}

export default class UnpaidWorkUtils {
  static unpaidWorkHoursDetails(detail: CommonUnpaidWorkDetailsDto): UnpaidWorkHoursDetails {
    const totalHoursOrdered = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.requiredMinutes)
    const eteHoursCredited = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.completedEteMinutes)
    const eteHoursRemaining = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.remainingEteMinutes)
    const totalHoursCompleted = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.completedMinutes)
    const maximumEteHours = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.allowedEteMinutes)
    const totalHoursRemaining = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.remainingMinutes)

    return {
      totalHoursOrdered,
      maximumEteHours,
      eteHoursCredited,
      eteHoursRemaining,
      totalHoursRemaining,
      totalHoursCompleted,
    }
  }

  static getRemainingEteHoursAndMinutes(
    formData: CourseCompletionForm,
    detail: CommonUnpaidWorkDetailsDto,
  ): string | null {
    if (!detail || !formData?.timeToCredit) return null

    const { hours, minutes } = formData.timeToCredit
    const credited = DateTimeFormats.hoursAndMinutesToMinutes(hours, minutes)

    const result = detail.remainingEteMinutes - credited

    return result >= 0 ? DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(result) : null
  }

  static getUnpaidWorkOptions(unpaidWorkDetails: Array<CommonUnpaidWorkDetailsDto>, selectedOptionValue?: number) {
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

  static unpaidWorkSummaryItem(unpaidWorkDetails: UnpaidWorkDetailsDtoWithCount | undefined, changePath: string) {
    const requirementDetails = unpaidWorkDetails?.details
      ? UnpaidWorkUtils.summaryString(unpaidWorkDetails.details)
      : undefined

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

  static unpaidWorkHoursCardList(
    unpaidWorkDetails: CommonUnpaidWorkDetailsDto,
    options?: { includeDescription?: boolean },
  ): Array<{ key: string; value: string; description?: string; cardClassList?: string }> {
    const formattedHours = this.unpaidWorkHoursDetails(unpaidWorkDetails)

    // Describe any negative adjustments to the requirement as positive time included in completed minutes
    const hoursCompletedDescription =
      options?.includeDescription && unpaidWorkDetails.totalAdjustmentMinutes < 0
        ? `Includes ${DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(Math.abs(unpaidWorkDetails.totalAdjustmentMinutes))} of adjustments`
        : undefined

    return [
      {
        key: 'Hours remaining',
        value: formattedHours.totalHoursRemaining,
        cardClassList: 'card--highlight-blue',
      },
      {
        key: 'Hours ordered',
        value: formattedHours.totalHoursOrdered,
        description: options?.includeDescription ? 'On this requirement' : undefined,
      },
      {
        key: 'Hours credited',
        value: formattedHours.totalHoursCompleted,
        description: hoursCompletedDescription,
      },
    ]
  }

  static otherRequirementsSummary(
    unpaidWorkDetails: Array<CommonUnpaidWorkDetailsDto>,
    currentEventNumber: number,
  ): OtherUnpaidWorkRequirementsSummary {
    const reducer = (currentTotal: number, detail: CommonUnpaidWorkDetailsDto) => {
      const toAdd = detail.remainingMinutes
      return currentTotal + toAdd
    }

    const otherRequirements = unpaidWorkDetails.filter(requirement => requirement.eventNumber !== currentEventNumber)
    const totalMinutes = otherRequirements.reduce(reducer, 0)
    return {
      count: otherRequirements.length,
      totalMinutes,
      humanReadableTotalHours: DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(totalMinutes),
    }
  }

  private static summaryString(unpaidWorkDetails: CommonUnpaidWorkDetailsDto) {
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
}
