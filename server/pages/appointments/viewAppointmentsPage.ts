import { AdjustmentDto, AppointmentSummaryDto } from '../../@types/shared'
import {
  AdjustmentsSortField,
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
  adjustments: {
    name: 'Adjustments',
    path: 'adjustments',
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
          html: AppointmentUtils.buildTime(appointment),
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

  static buildAdjustmentList(
    adjustments: AdjustmentDto[],
    originalPath: string,
    { crn, deliusEventNumber }: { crn: string; deliusEventNumber: string },
  ) {
    return adjustments.map(adjustment => {
      return [
        {
          text: DateTimeFormats.isoDateToUIDate(adjustment.date),
          attributes: {
            'data-sort-value': DateTimeFormats.isoToMilliseconds(adjustment.date),
          },
        },
        { text: adjustment.reason },
        { text: DateTimeFormats.formatAdjustmentTime(adjustment.amount) },
        adjustment.id
          ? {
              html: HtmlUtils.getAnchor(
                'Delete',
                pathWithOriginalPath(
                  paths.people.adjustments.delete({ crn, deliusEventNumber, adjustmentId: adjustment.id }),
                  originalPath,
                ),
              ),
            }
          : null,
      ]
    })
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

    return Object.values(ViewAppointmentsNavigationTabs).flatMap(
      (tab: Record<string, string>): GovUkTab | GovUkTab[] => {
        if (!config.featureFlags.adjustmentsEnabled) {
          if (tab.path === 'adjustments') {
            return []
          }
        }
        return {
          html: tab.path === 'missing-outcomes' ? badge`${tab.name} ${missingCount}` : tab.name,
          href: tab.path,
          active: appointmentSection === tab.path,
        }
      },
    )
  }

  static tableHeaders(
    sortBy: AppointmentsSortField | AppointmentsSortField[] | AdjustmentsSortField | AdjustmentsSortField[],
    sortDirection: SortDirection,
    hrefPrefix: string,
    isAdjustmentsTab: boolean = false,
  ): Array<TableCell> {
    if (isAdjustmentsTab) {
      return [
        sortHeader<AdjustmentsSortField>('Date', 'date', sortBy, sortDirection, hrefPrefix, 'search-results'),
        sortHeader<AdjustmentsSortField>('Reason', 'reason', sortBy, sortDirection, hrefPrefix, 'search-results'),
        sortHeader<AdjustmentsSortField>(
          'Time adjusted',
          'minutes',
          sortBy,
          sortDirection,
          hrefPrefix,
          'search-results',
        ),
        { text: 'Action' },
      ]
    }
    return [
      sortHeader<AppointmentsSortField | AdjustmentsSortField>(
        'Date',
        'date',
        sortBy,
        sortDirection,
        hrefPrefix,
        'search-results',
      ),
      { text: 'Project' },
      { text: 'Project type' },
      { text: 'Time' },
      { text: 'Attendance' },
      { text: 'Action' },
    ]
  }
}
