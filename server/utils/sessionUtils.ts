import { AppointmentDto, SessionDto, SessionSummariesDto, SessionSummaryDto } from '../@types/shared'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import { GovUKValue } from '../@types/user-defined'
import { pathWithQuery } from './utils'
import { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'

export default class SessionUtils {
  static sessionResultTableRows(sessions: SessionSummariesDto, query: GroupSessionIndexPageInput) {
    return sessions.content.map(session => {
      const showPath = SessionUtils.getSessionPath(session)
      const showPathWithQuery = pathWithQuery(showPath, query)
      const projectLink = HtmlUtils.getAnchor(session.projectName, showPathWithQuery)

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

  static sessionListTableRows(session: SessionDto) {
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
        SessionUtils.getAppointmentActionCell(appointment.id, session.projectCode, offender),
      ]
    })
  }

  static getSessionPath(session: SessionSummaryDto | AppointmentDto) {
    const { date, projectCode } = session
    return `${paths.sessions.show({ projectCode, date })}`
  }

  static getAppointmentActionCell(appointmentId: number, projectCode: string, offender: Offender): GovUKValue {
    if (offender.isLimited) {
      return { text: '' }
    }

    const actionContent = `Update ${HtmlUtils.getHiddenText(offender.name)}`
    const linkHtml = HtmlUtils.getAnchor(
      actionContent,
      paths.appointments.appointmentDetails({ appointmentId: appointmentId.toString(), projectCode }),
    )

    return { html: linkHtml }
  }

  private static getNotEnteredTag() {
    return HtmlUtils.getStatusTag('Not entered', 'grey')
  }
}
