import { AppointmentSummaryDto, PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import { SortDirection, TableCell, TravelTimeSortField, ValidationErrors } from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import PageWithValidation from '../pageWithValidation'
import sortHeader from '../../utils/sortHeader'
import { pathWithQuery } from '../../utils/utils'
import appointmentSummaryFactory from '../../testutils/factories/appointmentSummaryFactory'

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
      const offender = new Offender(row.offender)

      const link = offender.isLimited
        ? ''
        : HtmlUtils.getAnchor(
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

      const appointment = {
        ...appointmentSummaryFactory.build(),
        projectCode: row.projectCode,
        id: row.deliusAppointmentId,
      } as AppointmentSummaryDto

      return [
        {
          html: offender.getTableHtml(
            appointment,
            pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch),
          ),
        },
        { text: DateTimeFormats.isoDateToUIDate(row.date) },
        { text: row.projectTypeName },
        { html: link },
      ]
    })
  }
}
