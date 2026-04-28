import { AppointmentDto, SessionDto, SessionSummariesDto, SessionSummaryDto } from '../@types/shared'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import { GovUKValue } from '../@types/user-defined'
import { pathWithQuery } from './utils'
import { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'

type AppointmentActionCellParams = {
  appointmentId: number
  projectCode: string
  offender: Offender
  originalSearch: Record<string, string>
}

export default class SessionUtils {
  static sessionResultTableRows(sessions: SessionSummariesDto, query: GroupSessionIndexPageInput) {
    return sessions.content.map(session => {
      const showPath = SessionUtils.getSessionPath(session, query)
      const projectLink = HtmlUtils.getAnchor(session.projectName, showPath)

      return [
        {
          html: `${HtmlUtils.getElementWithContent(projectLink)}${HtmlUtils.getElementWithContent(session.projectCode)}`,
        },
        { text: DateTimeFormats.isoDateToUIDate(session.date) },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }

  static sessionListTableRows(session: SessionDto, originalSearch: Record<string, string>) {
    return session.appointmentSummaries.map(appointment => {
      const offender = new Offender(appointment.offender)
      const minutesRemaining =
        appointment.requirementMinutes - appointment.completedMinutes + appointment.adjustmentMinutes

      return [
        { text: offender.name },
        { text: offender.crn },
        { text: DateTimeFormats.minutesToHoursAndMinutes(appointment.requirementMinutes) },
        { text: DateTimeFormats.minutesToHoursAndMinutes(appointment.completedMinutes) },
        { text: DateTimeFormats.minutesToHoursAndMinutes(minutesRemaining) },
        { html: appointment.contactOutcome?.name || SessionUtils.getNotEnteredTag() },
        SessionUtils.getAppointmentActionCell({
          appointmentId: appointment.id,
          projectCode: session.projectCode,
          offender,
          originalSearch,
        }),
      ]
    })
  }

  static getSessionPath(session: SessionSummaryDto | AppointmentDto, query: Record<string, string>) {
    const { date, projectCode } = session
    return pathWithQuery(paths.sessions.show({ projectCode, date }), query)
  }

  static getAppointmentActionCell({
    appointmentId,
    projectCode,
    offender,
    originalSearch,
  }: AppointmentActionCellParams): GovUKValue {
    if (offender.isLimited) {
      return { text: '' }
    }

    const actionContent = `Update ${HtmlUtils.getHiddenText(offender.name)}`
    const linkHtml = HtmlUtils.getAnchor(
      actionContent,
      pathWithQuery(
        paths.appointments.appointmentDetails({ appointmentId: appointmentId.toString(), projectCode }),
        originalSearch,
      ),
    )

    return { html: linkHtml }
  }

  private static getNotEnteredTag() {
    return HtmlUtils.getStatusTag('Not entered', 'grey')
  }
}
