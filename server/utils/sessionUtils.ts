import { AppointmentDto, ContactOutcomeDto, SessionDto, SessionSummariesDto, SessionSummaryDto } from '../@types/shared'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import { AppointmentOrSessionParams, GovUkSummaryList, GovUKValue } from '../@types/user-defined'
import { AppointmentOutcomeForm } from '../services/forms/appointmentFormService'
import { pathWithQuery } from './utils'
import { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'
import AppointmentUtils from './appointmentUtils'

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
        { text: DateTimeFormats.timePeriod(appointment.startTime, appointment.endTime) },
        { text: DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(minutesRemaining) },
        { html: SessionUtils.getStatusTag(appointment.contactOutcome) },
        SessionUtils.getAppointmentActionCell({
          appointmentId: appointment.id,
          projectCode: session.projectCode,
          offender,
          originalSearch,
        }),
      ]
    })
  }

  static getSessionPath(
    appointmentOrSession: Pick<
      SessionSummaryDto | SessionDto | AppointmentDto | AppointmentOrSessionParams,
      'date' | 'projectCode'
    >,
    query?: Record<string, string>,
  ) {
    const { date, projectCode } = appointmentOrSession
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

    const actionContent = `View ${HtmlUtils.getHiddenText(offender.name)}`

    const linkHtml = HtmlUtils.getAnchor(
      actionContent,
      pathWithQuery(
        paths.appointments.update({
          appointmentId: appointmentId.toString(),
          projectCode,
          page: 'appointment-details',
        }),
        originalSearch,
      ),
    )

    return { html: linkHtml }
  }

  static selectedPeopleCard(
    session: SessionDto,
    selectedAppointments: AppointmentOutcomeForm['appointments'],
    formId: string,
  ): GovUkSummaryList {
    const ids = selectedAppointments.map(appointment => appointment.id)
    const rows = session.appointmentSummaries
      .filter(appointment => ids.includes(appointment.id))
      .map(appointment => {
        const offender = new Offender(appointment.offender)

        return {
          key: { text: offender.details.description },
          value: { text: DateTimeFormats.timePeriod(appointment.startTime, appointment.endTime) },
        }
      })

    return {
      card: {
        title: { text: 'Selected people', headingLevel: 2 },
        actions: {
          items: [
            {
              href: pathWithQuery(
                paths.sessions.update({ date: session.date, projectCode: session.projectCode, page: 'select-people' }),
                {
                  form: formId,
                },
              ),
              text: 'Change',
              visuallyHiddenText: 'selected people',
            },
          ],
        },
      },
      rows,
      classes: 'govuk-summary-list--no-fixed-width govuk-summary-list--float-values-right',
    }
  }

  private static getStatusTag(contactOutcome?: ContactOutcomeDto) {
    const text = contactOutcome?.name || 'Not entered'
    return HtmlUtils.getStatusTag(text, AppointmentUtils.getStatusColour(contactOutcome), true)
  }
}
