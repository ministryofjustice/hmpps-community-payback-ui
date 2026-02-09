import { AppointmentSummaryDto } from '../../server/@types/shared'
import DateTimeFormats from '../../server/utils/dateTimeUtils'

export default class Utils {
  static sortByDate = (a: AppointmentSummaryDto, b: AppointmentSummaryDto) => {
    const dateA = DateTimeFormats.isoToMilliseconds(a.date)
    const dateB = DateTimeFormats.isoToMilliseconds(b.date)
    return dateA - dateB
  }
}
