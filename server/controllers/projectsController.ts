import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectService from '../services/projectService'
import ProviderService from '../services/providerService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'
import { generateErrorTextList } from '../utils/errorUtils'
import ProjectIndexPage from '../pages/projectIndexPage'
import getProvidersAndTeams from './shared/getProvidersAndTeams'

export default class ProjectsController {
  constructor(
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
      const teamCode = _req.query.team?.toString() ?? undefined
      const providerCode = _req.query.provider?.toString() || undefined

      const form = await getProvidersAndTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
        teamCode,
      })

      const individualPlacementProjects = await this.projectService.getIndividualPlacementProjects({
        providerCode,
        teamCode,
        username: res.locals.user.username,
      })

      const projectRows = ProjectIndexPage.projectSummaryList(individualPlacementProjects)

      res.render('projects/index', {
        form,
        projectRows,
        showNoResultsMessage: projectRows.length === 0,
        backPath: '/',
      })
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode } = _req.params
      const request = { projectCode, username: res.locals.user.username }

      const project = await this.projectService.getProject(request)
      const appointments = await this.appointmentService.getProjectAppointmentsWithMissingOutcomes(request)

      const formattedProject = ProjectPage.projectDetails(project)

      const appointmentList = ProjectPage.appointmentList(appointments.content, projectCode)
      const errorList = generateErrorTextList(res.locals.errorMessages)

      res.render('projects/show', {
        project: formattedProject,
        appointmentList,
        backPath: paths.projects.index.pattern,
        errorList,
      })
    }
  }
}
