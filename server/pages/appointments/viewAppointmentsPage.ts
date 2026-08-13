import { AppointmentSummaryDto } from '../../@types/shared'
import { GovUkTab, ViewAppointmentsNavigationTabValues } from '../../@types/user-defined'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'

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
  static buildAppointmentList(appointments: AppointmentSummaryDto[]) {
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
          text: `${DateTimeFormats.stripTime(appointment.startTime)}-${DateTimeFormats.stripTime(appointment.endTime)}`,
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
            paths.appointments.update({
              projectCode: appointment.projectCode,
              appointmentId: appointment.id.toString(),
              page: 'appointment-details',
            }),
          ),
        },
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

    return Object.values(ViewAppointmentsNavigationTabs).map(tab => {
      return {
        html: tab.path === 'missing-outcomes' ? badge`${tab.name} ${missingCount}` : tab.name,
        href: tab.path,
        active: appointmentSection === tab.path,
      }
    })
  }
}
