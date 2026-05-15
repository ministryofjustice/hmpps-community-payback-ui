import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectService from '../services/projectService'
import ProviderService from '../services/providerService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'
import { generateErrorTextList } from '../utils/errorUtils'
import ProjectIndexPage, { ProjectIndexPageInput } from '../pages/projectIndexPage'
import getProvidersAndTeams from './shared/getProvidersAndTeams'
import { pathWithQuery } from '../utils/utils'
import { ProjectsSortField } from '../@types/user-defined'
import { getPaginationRequestParams } from '../utils/paginationUtils'
import AuditService, { Page } from '../services/auditService'

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

      const { page, ...rest } = _req.query

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationRequestParams<ProjectsSortField>(
        _req,
        paths.projects.filter({}),
        {
          provider: providerCode,
          ...rest,
        },
        projectsSortFields,
      )

      const individualPlacementProjects = await this.projectService.getIndividualPlacementProjects({
        providerCode,
        teamCode,
        username: res.locals.user.username,
        page: pageNumber,
        sortBy,
        sortDirection,
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
      const request = { projectCode, username: res.locals.user.username }

      const project = await this.projectService.getProject(request)
      const appointments = await this.appointmentService.getProjectAppointmentsWithMissingOutcomes(request)

      appointments.content.forEach(appointment => {
        if (appointment.offender.crn) {
          this.auditService.hmppsAuditClient.sendAuditMessage(
            Page.VIEW_INDIVIDUAL_PLACEMENTS,
            res.locals.user.username,
            _req.params,
            _req.id,
            'CRN',
            appointment.offender.crn,
          )
        }
      })

      const formattedProject = ProjectPage.projectDetails(project)
      const query = _req.query as ProjectIndexPageInput
      const appointmentList = ProjectPage.appointmentList(appointments.content, projectCode, query)
      const backPath = ProjectIndexPage.objectContainsSearchProperty(query)
        ? pathWithQuery(paths.projects.filter({}), query)
        : paths.projects.index({})
      const errorList = generateErrorTextList(res.locals.errorMessages)

      res.render('projects/show', {
        project: formattedProject,
        appointmentList,
        backPath,
        errorList,
      })
    }
  }
}
