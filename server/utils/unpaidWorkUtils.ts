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

  private static totalHoursRemaining(detail: UnpaidWorkDetailsDto) {
    return DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.requiredMinutes - detail.completedMinutes)
  }
}
