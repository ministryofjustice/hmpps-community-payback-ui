import { AppointmentSummaryDto } from '../../@types/shared'
import {
  AppointmentsSortField,
  GovUkTab,
  SortDirection,
  TableCell,
  ViewAppointmentsNavigationTabValues,
} from '../../@types/user-defined'
import config from '../../config'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import sortHeader from '../../utils/sortHeader'
import { pathWithOriginalPath } from '../../utils/utils'

export const ViewAppointmentsNavigationTabs = {
  upcoming: {
    name: 'Upcoming appointments',
    path: 'upcoming',
  },
  missingOutcomes: {
    name: 'Missing outcomes',
    path: 'missing-outcomes',
  },
  past: {
    name: 'Past appointments',
    path: 'past',
  },
} as const satisfies Record<string, ViewAppointmentsNavigationTabValues>

export class ViewAppointmentsPage {
  static defaultSection = ViewAppointmentsNavigationTabs.upcoming.path

  static buildAppointmentList(appointments: AppointmentSummaryDto[], originalPath: string) {
    return appointments.map(appointment => {
      const outcome = appointment.contactOutcome
      return [
        {
          text: DateTimeFormats.isoDateToUIDate(appointment.date),
          attributes: {
            'data-sort-value': DateTimeFormats.isoToMilliseconds(appointment.date),
          },
        },
        {
          text: appointment.projectName,
        },
        {
          text: appointment.projectTypeName,
        },
        {
          html: this.handleTime(appointment),
          classes: 'cpb-td-white-space-nowrap',
        },
        {
          html: HtmlUtils.getStatusTag(
            outcome ? outcome.name : 'Not entered',
            AppointmentUtils.getStatusColour(outcome),
            true,
          ),
        },
        {
          html: HtmlUtils.getAnchor(
            'View',
            pathWithOriginalPath(
              paths.appointments.update({
                projectCode: appointment.projectCode,
                appointmentId: appointment.id.toString(),
                page: 'appointment-details',
              }),
              originalPath,
            ),
          ),
        },
      ]
    })
  }

  static handleTime(appointment: AppointmentSummaryDto) {
    const time = `${DateTimeFormats.stripTime(appointment.startTime)} - ${DateTimeFormats.stripTime(appointment.endTime)}`

    if (!config.featureFlags.travelTimeNewEnabled) {
      return time
    }

    const travelTimeAdjustment = AppointmentUtils.getTravelTimeAdjustmentFromAppointment(appointment)
    let adjustmentText = ''
    if (travelTimeAdjustment) {
      adjustmentText += `<br>+${AppointmentUtils.getTravelTimeAdjustmentText(travelTimeAdjustment)} total travel time`
    }

    return time + adjustmentText
  }

  static buildNavigation(appointmentSection: string, missingCount: number = 0): GovUkTab[] {
    const badge = (_str: TemplateStringsArray, title: string, count: number = 0) => {
      const tag =
        count === 0
          ? ''
          : `
        <span class="moj-notification-badge">
          <span aria-hidden="true">${count}</span>
          <span class="govuk-visually-hidden">(${count} ${title.toLocaleLowerCase()})</span>
        </span>
      `

      return `${title}${tag}`
    }

    return Object.values(ViewAppointmentsNavigationTabs).map(tab => {
      return {
        html: tab.path === 'missing-outcomes' ? badge`${tab.name} ${missingCount}` : tab.name,
        href: tab.path,
        active: appointmentSection === tab.path,
      }
    })
  }

  static tableHeaders(
    sortBy: AppointmentsSortField | AppointmentsSortField[],
    sortDirection: SortDirection,
    hrefPrefix: string,
  ): Array<TableCell> {
    return [
      sortHeader<AppointmentsSortField>('Date', 'date', sortBy, sortDirection, hrefPrefix, 'search-results'),
      { text: 'Project' },
      { text: 'Project type' },
      { text: 'Time' },
      { text: 'Attendance' },
      { text: 'Action' },
    ]
  }
}
