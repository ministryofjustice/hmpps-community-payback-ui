import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectService from '../services/projectService'
import ProviderService from '../services/providerService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'
import getTeams from './shared/getTeams'
import { generateErrorTextList } from '../utils/errorUtils'
import ProjectIndexPage from '../pages/projectIndexPage'

export default class ProjectsController {
  private readonly providerCode = 'N56'

  constructor(
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly appointmentService: AppointmentService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode: this.providerCode,
        response: res,
      })

      res.render('projects/index', {
        teamItems,
        backPath: '/',
      })
    }
  }

  filter(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamCode = _req.query.team?.toString() ?? undefined

      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode: this.providerCode,
        response: res,
        teamCode,
      })

      const individualPlacementProjects = await this.projectService.getIndividualPlacementProjects({
        providerCode: this.providerCode,
        teamCode,
        username: res.locals.user.username,
      })

      const projectRows = ProjectIndexPage.projectSummaryList(individualPlacementProjects)

      res.render('projects/index', {
        teamItems,
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
