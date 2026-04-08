import { OffenderFullDto, PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { generateErrorSummary } from '../../utils/errorUtils'

export type SearchTravelTimePageInput = {
  provider: string
}

export default class SearchTravelTimePage {
  static validationErrors(query: SearchTravelTimePageInput) {
    const errors: ValidationErrors<SearchTravelTimePageInput> = {}

    if (!query.provider) {
      errors.provider = { text: 'Choose a region' }
    }

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  static getRows(tasks: PagedModelAppointmentTaskSummaryDto) {
    if (!tasks?.content?.length) {
      return []
    }

    return tasks.content.map(row => {
      const { appointment } = row
      return [
        {
          text: `${(appointment.offender as OffenderFullDto).forename} ${(appointment.offender as OffenderFullDto).surname}`,
        },
        { text: appointment.offender?.crn },
        { text: DateTimeFormats.isoDateToUIDate(appointment.date) },
        { text: appointment.projectTypeName },
        { html: "<a href='#'>Update</a>" },
      ]
    })
  }
}
