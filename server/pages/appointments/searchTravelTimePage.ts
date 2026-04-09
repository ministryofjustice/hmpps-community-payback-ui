import { PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import PageWithValidation from '../pageWithValidation'

export type SearchTravelTimePageInput = {
  provider: string
}

export default class SearchTravelTimePage extends PageWithValidation<SearchTravelTimePageInput> {
  protected getValidationErrors(query: SearchTravelTimePageInput): ValidationErrors<SearchTravelTimePageInput> {
    const validationErrors = {} as ValidationErrors<SearchTravelTimePageInput>

    if (!query.provider) {
      validationErrors.provider = { text: 'Choose a region' }
    }

    return validationErrors
  }

  static getRows(tasks: PagedModelAppointmentTaskSummaryDto) {
    if (!tasks?.content?.length) {
      return []
    }

    return tasks.content.map(row => {
      const { appointment } = row
      const link = HtmlUtils.getAnchor(
        'Update',
        paths.appointments.travelTime.update({
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
        }),
      )

      return [
        { text: new Offender(appointment.offender).name },
        { text: appointment.offender.crn },
        { text: DateTimeFormats.isoDateToUIDate(appointment.date) },
        { text: appointment.projectTypeName },
        { html: link },
      ]
    })
  }
}
