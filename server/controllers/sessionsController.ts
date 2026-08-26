import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import GroupSessionIndexPage, { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import getProvidersAndTeams from './shared/getProvidersAndTeams'
import { generateErrorSummary, generateErrorTextList } from '../utils/errorUtils'
import { pathWithQuery } from '../utils/utils'
import paths from '../paths'
import { Session, SessionsSortField } from '../@types/user-defined'
import { getPaginationRequestParams } from '../utils/paginationUtils'
import AuditService, { Page } from '../services/auditService'
import config from '../config'
import { AppointmentDto, SessionSummaryDto, ProjectTypeDto } from '../@types/shared'
import ReferenceDataService from '../services/referenceDataService'

export const sessionsSortFields = ['date', 'projectName', 'allocatedCount', 'outcomeCount'] as const

export default class SessionsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerCode = _req.query.provider?.toString() || undefined
      const providersAndTeams = await getProvidersAndTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
      })

      res.render('sessions/index', {
        form: providersAndTeams,
        searchPath: paths.sessions.search({}),
        inductionTabsEnabled: config.featureFlags.inductionTabsEnabled,
      })
    }
  }

  search(projectTypeGroup: Extract<ProjectTypeDto['group'], 'GROUP' | 'INDUCTION'>): RequestHandler {
    return async (_req: Request, res: Response) => {
      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query } as GroupSessionIndexPageInput
      const teamCode = query.team?.toString() ?? undefined
      const providerCode = _req.query.provider?.toString() || undefined

      const response = await this.referenceDataService.getProjectTypes(res.locals.user.username, projectTypeGroup)
      const projectTypeCodes = response.projectTypes.map(projectType => projectType.code)

      const { provider, providerItems, teamItems } = await getProvidersAndTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
        teamCode,
      })

      const indexPage = new GroupSessionIndexPage(query)
      const validationErrors = indexPage.validationErrors()

      if (Object.keys(validationErrors).length !== 0) {
        const errorSummary = generateErrorSummary(validationErrors)

        return res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          form: { teamItems, providerItems, ...indexPage.items(), provider },
          sessionRows: [],
          searchPath: projectTypeGroup === 'INDUCTION' ? paths.sessions.inductions({}) : paths.sessions.search({}),
          subnavigationItems: [
            {
              text: 'Group sessions',
              href: pathWithQuery(paths.sessions.search({}), query),
              active: projectTypeGroup === 'GROUP',
            },
            {
              text: 'Inductions',
              href: pathWithQuery(paths.sessions.inductions({}), query),
              active: projectTypeGroup === 'INDUCTION',
            },
          ],
          inductionTabsEnabled: config.featureFlags.inductionTabsEnabled,
        })
      }

      const { page, ...rest } = _req.query

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationRequestParams<SessionsSortField>(
        _req,
        projectTypeGroup === 'INDUCTION' ? paths.sessions.inductions({}) : paths.sessions.search({}),
        {
          provider: providerCode,
          ...rest,
        },
        sessionsSortFields,
      )

      const sessions = await this.sessionService.getSessions({
        ...indexPage.searchValues(),
        username: res.locals.user.username,
        providerCode,
        projectType: projectTypeCodes,
        page: pageNumber,
        sortBy,
        sortDirection,
      })

      const tableHeaders = GroupSessionIndexPage.tableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)
      const sessionRows = SessionUtils.sessionResultTableRows(sessions, query)

      return res.render('sessions/index', {
        form: {
          ...indexPage.items(),
          providerItems,
          provider,
          teamItems,
        },
        tableHeaders,
        sessionRows,
        showNoResultsMessage: sessionRows.length === 0,
        pageNumber: sessions.page.number,
        totalPages: sessions.page.totalPages,
        totalElements: sessions.page.totalElements,
        pageSize: sessions.page.size,
        hrefPrefix,
        searchPath: projectTypeGroup === 'INDUCTION' ? paths.sessions.inductions({}) : paths.sessions.search({}),
        subnavigationItems: [
          {
            text: 'Group sessions',
            href: pathWithQuery(paths.sessions.search({}), query),
            active: projectTypeGroup === 'GROUP',
          },
          {
            text: 'Inductions',
            href: pathWithQuery(paths.sessions.inductions({}), query),
            active: projectTypeGroup === 'INDUCTION',
          },
        ],
        inductionTabsEnabled: config.featureFlags.inductionTabsEnabled,
      })
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode, date } = _req.params

      const request = {
        username: res.locals.user.username,
        projectCode,
        date,
      }
      const query = _req.query as GroupSessionIndexPageInput
      const session = await this.sessionService.getSession(request)
      const sessionList = SessionUtils.sessionListTableRows(session, { originalPath: _req.originalUrl })
      const formattedDate = DateTimeFormats.isoDateToUIDate(date)
      const formattedLocation = LocationUtils.locationToString(session.location)

      session.appointmentSummaries.forEach(appointment => {
        if (appointment.offender.crn) {
          this.auditService.sendAuditMessage({
            action: Page.VIEW_SESSION_APPOINTMENTS,
            username: res.locals.user.username,
            details: _req.params,
            correlationId: _req.id,
            subjectType: 'CRN',
            subjectId: appointment.offender.crn,
          })
        }
      })

      const backPath = _req.query?.originalPath
        ? decodeURIComponent(_req.query.originalPath.toString())
        : paths.sessions.index({})
      const errorList = generateErrorTextList(res.locals.errorMessages)

      const availableAppointments = session.appointmentSummaries.filter(
        summary => !summary.contactOutcome && summary.offender.objectType === 'Full',
      )
      const shouldShowBulkUpdate = availableAppointments.length > 0

      res.render('sessions/show', {
        session: {
          ...session,
          date: formattedDate,
          formattedLocation,
          region: session.providerName,
          team: session.teamName,
          projectType: session.projectType.name,
        },
        sessionList,
        backPath,
        errorList,
        bulkUpdatePath: shouldShowBulkUpdate
          ? pathWithQuery(paths.sessions.update({ projectCode, date, page: 'select-people' }), query)
          : undefined,
        createAppointmentPath: this.getCreateAppointmentPath(session, _req.originalUrl),
      })
    }
  }

  private getCreateAppointmentPath(
    appointmentOrSession: SessionSummaryDto | Session | AppointmentDto,
    originalPath: string,
  ) {
    if (!config.featureFlags.createAppointmentEnabled) {
      return null
    }

    const { date, projectCode } = appointmentOrSession

    return pathWithQuery(
      paths.sessions.create.findAPerson({ projectCode, date }),
      {
        originalPath,
      },
      { encode: true },
    )
  }
}
