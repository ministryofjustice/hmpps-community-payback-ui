import { PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import { SortDirection, TableCell, TravelTimeSortField, ValidationErrors } from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import PageWithValidation from '../pageWithValidation'
import sortHeader from '../../utils/sortHeader'
import { pathWithQuery } from '../../utils/utils'

export type SearchTravelTimePageInput = {
  provider?: string
}

export default class SearchTravelTimePage extends PageWithValidation<SearchTravelTimePageInput> {
  protected getValidationErrors(query: SearchTravelTimePageInput): ValidationErrors<SearchTravelTimePageInput> {
    const validationErrors = {} as ValidationErrors<SearchTravelTimePageInput>

    if (!query.provider) {
      validationErrors.provider = { text: 'Choose a region' }
    }

    return validationErrors
  }

  static tableHeaders(
    sortBy: TravelTimeSortField | TravelTimeSortField[],
    sortDirection: SortDirection,
    hrefPrefix: string,
  ): Array<TableCell> {
    return [
      { text: 'Name' },
      sortHeader<TravelTimeSortField>('CRN', 'appointment.crn', sortBy, sortDirection, hrefPrefix, 'search-results'),
      sortHeader<TravelTimeSortField>('Date', 'appointment.date', sortBy, sortDirection, hrefPrefix, 'search-results'),
      { text: 'Appointment type' },
      {
        text: 'Action',
      },
    ]
  }

  static getRows(tasks: PagedModelAppointmentTaskSummaryDto, originalSearch: SearchTravelTimePageInput) {
    if (!tasks?.content?.length) {
      return []
    }

    return tasks.content.map(row => {
      const link = HtmlUtils.getAnchor(
        'Update',
        pathWithQuery(
          paths.appointments.travelTime.update({
            appointmentId: row.deliusAppointmentId.toString(),
            projectCode: row.projectCode,
            taskId: row.taskId,
          }),
          originalSearch,
        ),
      )

      return [
        { text: new Offender(row.offender).name },
        { text: row.offender.crn },
        { text: DateTimeFormats.isoDateToUIDate(row.date) },
        { text: row.projectTypeName },
        { html: link },
      ]
    })
  }
}
