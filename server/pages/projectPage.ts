import { AppointmentSummaryDto, ProjectDto } from '../@types/shared'
import { GovUkTab } from '../@types/user-defined'
import Offender from '../models/offender'
import paths from '../paths'
import AppointmentUtils from '../utils/appointmentUtils'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import SessionUtils, { AppointmentActionCellParams } from '../utils/sessionUtils'
import { pathWithQuery } from '../utils/utils'

interface ProjectViewData {
  name: string
  address: string
  primaryContact: {
    name: string
    email: string
    phone: string
  }
}

export type ViewProjectAppointmentsNavigationTabValues = {
  name: 'Missing outcomes' | 'Past appointments'
  path: 'missing-outcomes' | 'past'
}

export const ViewProjectAppointmentsNavigationTabs = {
  missingOutcomes: {
    name: 'Missing outcomes',
    path: 'missing-outcomes',
  },
  past: {
    name: 'Past appointments',
    path: 'past',
  },
} as const satisfies Record<string, ViewProjectAppointmentsNavigationTabValues>

export default class ProjectPage {
  static defaultSection = ViewProjectAppointmentsNavigationTabs.missingOutcomes.path

  static appointmentList(
    appointments: Array<AppointmentSummaryDto>,
    projectCode: string,
    query: AppointmentActionCellParams['query'],
  ) {
    return appointments.map(appointment => {
      const offender = new Offender(appointment.offender)
      return [
        { html: offender.getTableHtml(appointment, query.originalPath) },
        {
          text: DateTimeFormats.isoDateToUIDate(appointment.date),
          attributes: {
            'data-sort-value': DateTimeFormats.isoToMilliseconds(appointment.date),
          },
        },
        {
          html: AppointmentUtils.buildTime(appointment),
          classes: 'cpb-td-white-space-nowrap',
        },
        { html: AppointmentUtils.getStatusTag(appointment.contactOutcome) },
        SessionUtils.getAppointmentActionCell({
          appointmentId: appointment.id,
          projectCode,
          offender,
          query,
        }),
      ]
    })
  }

  static projectDetails(project: ProjectDto): ProjectViewData {
    return {
      name: project.projectName,
      address: LocationUtils.locationToString(project.location, { withLineBreaks: false }),
      primaryContact: {
        name: project.beneficiaryDetails.contactName,
        email: project.beneficiaryDetails.emailAddress,
        phone: project.beneficiaryDetails.telephoneNumber,
      },
    }
  }

  static buildNavigation(
    appointmentSection: string,
    missingCount: number,
    pathData: { projectCode: string; query: Record<string, string> },
  ): GovUkTab[] {
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

    return Object.values(ViewProjectAppointmentsNavigationTabs).map(tab => {
      const path = paths.projects.showTab({ projectCode: pathData.projectCode, appointmentSection: tab.path })
      const { page, ...queryParams } = pathData.query
      return {
        html: tab.path === 'missing-outcomes' ? badge`${tab.name} ${missingCount}` : tab.name,
        href: pathWithQuery(path, queryParams),
        active: appointmentSection === tab.path,
      }
    })
  }
}
