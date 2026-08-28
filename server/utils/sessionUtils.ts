import {
  AppointmentDto,
  AppointmentSummaryDto,
  ContactOutcomeDto,
  PagedModelSessionSummaryDto,
  SessionSummaryDto,
} from '../@types/shared'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import { AppointmentOrSessionParams, GovUkSummaryList, GovUKValue, Session } from '../@types/user-defined'
import { AppointmentOutcomeForm } from '../services/forms/appointmentFormService'
import { pathWithOriginalPath, pathWithQuery } from './utils'
import { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'
import AppointmentUtils from './appointmentUtils'

export type AppointmentActionCellParams = {
  appointmentId: number
  projectCode: string
  offender: Offender
  query: { originalPath: string }
}

export default class SessionUtils {
  static sessionResultTableRows(sessions: PagedModelSessionSummaryDto, query: GroupSessionIndexPageInput) {
    return sessions.content.map(session => {
      const showPath = SessionUtils.getSessionPath(session, query)
      const projectLink = HtmlUtils.getAnchor(session.projectName, showPath)

      return [
        {
          html: `${HtmlUtils.getElementWithContent(projectLink)}${HtmlUtils.getElementWithContent(decodeURIComponent(session.projectCode))}`,
        },
        { text: DateTimeFormats.isoDateToUIDate(session.date) },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }

  static sessionListTableRows(session: Session, query: AppointmentActionCellParams['query']): Array<Array<GovUKValue>> {
    return session.appointmentSummaries.map(appointment => {
      const offender = new Offender(appointment.offender)
      const minutesRemaining =
        appointment.requirementMinutes - appointment.completedMinutes + appointment.adjustmentMinutes

      const offenderViewLink = offender.isLimited
        ? ''
        : HtmlUtils.getAnchor(
            offender.getNameFormattedWithLastNameFirst(),
            pathWithOriginalPath(offender.viewPath(appointment), query.originalPath),
          )

      return [
        { html: offenderViewLink },
        { text: offender.crn },
        { text: DateTimeFormats.timePeriod(appointment.startTime, appointment.endTime) },
        { text: DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(minutesRemaining) },
        { html: SessionUtils.getStatusTag(appointment.contactOutcome) },
        SessionUtils.getAppointmentActionCell({
          appointmentId: appointment.id,
          projectCode: session.projectCode,
          offender,
          query,
        }),
      ]
    })
  }

  static getSessionPath(
    appointmentOrSession: Pick<
      SessionSummaryDto | Session | AppointmentDto | AppointmentOrSessionParams,
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
    query,
  }: AppointmentActionCellParams): GovUKValue {
    if (offender.isLimited) {
      return { text: '' }
    }

    const { originalPath } = query

    const actionContent = `View ${HtmlUtils.getHiddenText(offender.name)}`

    const linkHtml = HtmlUtils.getAnchor(
      actionContent,
      pathWithOriginalPath(
        paths.appointments.update({
          appointmentId: appointmentId.toString(),
          projectCode,
          page: 'appointment-details',
        }),
        originalPath,
      ),
    )

    return { html: linkHtml }
  }

  static selectedPeopleCard(
    pathData: AppointmentOrSessionParams,
    appointmentSummaries: Array<AppointmentSummaryDto>,
    selectedAppointments: AppointmentOutcomeForm['appointments'],
    formId: string,
  ): GovUkSummaryList {
    const ids = selectedAppointments.map(appointment => appointment.id)
    const rows = appointmentSummaries
      .filter(appointment => ids.includes(appointment.id))
      .map(appointment => {
        const offender = new Offender(appointment.offender)

        return {
          key: { text: offender.details.descriptionWithLastNameFirst },
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
                paths.sessions.update({
                  date: pathData.date,
                  projectCode: pathData.projectCode,
                  page: 'select-people',
                }),
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
