import type { Request, RequestHandler, Response } from 'express'
import ProjectPage, {
  ProjectAppointmentsSortFields,
  projectAppointmentsSortFields,
  ViewProjectAppointmentsNavigationTabValues,
} from '../pages/projectPage'
import ProjectService from '../services/projectService'
import ProviderService from '../services/providerService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'
import { generateErrorTextList } from '../utils/errorUtils'
import ProjectIndexPage, { ProjectIndexPageInput } from '../pages/projectIndexPage'
import getProvidersAndTeams from './shared/getProvidersAndTeams'
import { pathWithOriginalPath, pathWithQuery } from '../utils/utils'
import { ProjectsSortField } from '../@types/user-defined'
import { getPaginationRequestParams } from '../utils/paginationUtils'
import AuditService, { Page } from '../services/auditService'
import { PagedModelAppointmentSummaryDto, ProjectDto } from '../@types/shared'
import config from '../config'
import { GetAppointmentsRequest } from '../data/appointmentClient'
import DateTimeFormats from '../utils/dateTimeUtils'

export const projectsSortFields = ['name', 'overdueOutcomesCount', 'oldestOverdueInDays'] as const

export default class ProjectsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly appointmentService: AppointmentService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerCode = _req.query.provider?.toString() || undefined

      const providersAndTeams = await getProvidersAndTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
      })

      res.render('projects/index', {
        form: providersAndTeams,
        backPath: '/',
      })
    }
  }

  filter(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamCode = _req.query.team?.toString() || undefined
      const providerCode = _req.query.provider?.toString() || undefined

      const form = await getProvidersAndTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
        teamCode,
      })

      const validationErrors = ProjectIndexPage.validationErrors({ provider: providerCode, team: teamCode })

      if (validationErrors.hasErrors) {
        return res.render('projects/index', {
          form,
          errors: validationErrors.errors,
          errorSummary: validationErrors.errorSummary,
          backPath: '/',
        })
      }

      const { page, hrefPrefix, sortBy, sortDirection, size, sort } = getPaginationRequestParams<ProjectsSortField>(
        _req,
        paths.projects.filter({}),
        { by: 'name' },
        projectsSortFields,
      )

      const individualPlacementProjects = await this.projectService.getIndividualPlacementProjects({
        providerCode,
        teamCode,
        username: res.locals.user.username,
        page,
        sort,
        size,
      })

      const tableHeaders = ProjectIndexPage.tableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)

      const projectRows = ProjectIndexPage.projectSummaryList(individualPlacementProjects, {
        team: teamCode,
        provider: providerCode,
      })

      return res.render('projects/index', {
        form,
        tableHeaders,
        projectRows,
        showNoResultsMessage: projectRows.length === 0,
        backPath: '/',
        pageNumber: individualPlacementProjects.page.number,
        totalPages: individualPlacementProjects.page.totalPages,
        totalElements: individualPlacementProjects.page.totalElements,
        pageSize: individualPlacementProjects.page.size,
        hrefPrefix,
      })
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode } = _req.params
      const appointmentSection = _req.params.appointmentSection as ViewProjectAppointmentsNavigationTabValues['path']

      const request = { projectCode, username: res.locals.user.username }

      const project = await this.projectService.getProject(request)

      let notFoundText = 'There are no '

      const { provider, team } = _req.query as Record<string, string>
      const originalSearch: ProjectIndexPageInput = { provider, team }

      const { page, hrefPrefix, sortBy, sortDirection, size, sort } =
        getPaginationRequestParams<ProjectAppointmentsSortFields>(
          _req,
          paths.projects.showTab({ projectCode, appointmentSection }),
          { by: 'date', direction: appointmentSection === 'past' ? 'desc' : 'asc' },
          projectAppointmentsSortFields,
        )

      const tableHeaders = ProjectPage.tableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)

      const appointmentRequest: GetAppointmentsRequest = {
        toDate: DateTimeFormats.dateObjToIsoString(new Date()),
        page,
        size,
        sort,
      }

      let appointments: PagedModelAppointmentSummaryDto
      let missingOutcomeCount: number

      if (appointmentSection === 'past') {
        notFoundText += 'past appointments for this placement'
        appointments = await this.appointmentService.getProjectAppointments({
          ...request,
          query: { ...appointmentRequest, outcomeCodes: ['WITH_OUTCOME'] },
        })

        missingOutcomeCount = (
          await this.appointmentService.getProjectAppointments({
            ...request,
            query: { ...appointmentRequest, outcomeCodes: ['NO_OUTCOME'] },
          })
        ).page.totalElements
      } else {
        appointments = await this.appointmentService.getProjectAppointments({
          ...request,
          query: { ...appointmentRequest, outcomeCodes: ['NO_OUTCOME'] },
        })
        notFoundText += 'people allocated to this placement with missing outcomes'
        missingOutcomeCount = appointments.page.totalElements
      }

      const navItems = ProjectPage.buildNavigation(appointmentSection, missingOutcomeCount, {
        projectCode,
        query: originalSearch,
      })

      appointments.content.forEach(appointment => {
        if (appointment.offender.crn) {
          this.auditService.sendAuditMessage({
            action: Page.VIEW_INDIVIDUAL_PLACEMENTS,
            username: res.locals.user.username,
            details: _req.params,
            correlationId: _req.id,
            subjectType: 'CRN',
            subjectId: appointment.offender.crn,
          })
        }
      })

      const formattedProject = ProjectPage.projectDetails(project)
      const appointmentList = ProjectPage.appointmentList(appointments.content, projectCode, {
        originalPath: _req.originalUrl,
      })
      const backPath = ProjectIndexPage.objectContainsSearchProperty(originalSearch)
        ? pathWithQuery(paths.projects.filter({}), originalSearch)
        : paths.projects.index({})
      const errorList = generateErrorTextList(res.locals.errorMessages)

      res.render('projects/show', {
        project: formattedProject,
        appointmentList,
        navItems,
        backPath,
        errorList,
        createAppointmentPath: this.getCreateAppointmentPath(project, _req.originalUrl),
        notFoundText,
        tableHeaders,
        pageNumber: appointments.page.number,
        totalPages: appointments.page.totalPages,
        totalElements: appointments.page.totalElements,
        pageSize: appointments.page.size,
        hrefPrefix,
      })
    }
  }

  private getCreateAppointmentPath(project: ProjectDto, originalPath: string) {
    if (!config.featureFlags.createAppointmentEnabled) {
      return null
    }

    const { projectCode } = project

    return pathWithOriginalPath(paths.projects.create.findAPerson({ projectCode }), originalPath)
  }
}
