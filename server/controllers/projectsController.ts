import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectService from '../services/projectService'
import ProviderService from '../services/providerService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'
import getTeams from './shared/getTeams'

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

      res.render('projects/index', { teamItems })
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode } = _req.params
      const request = { projectCode, username: res.locals.user.username }

      const project = await this.projectService.getProject(request)
      const appointments = await this.appointmentService.getProjectAppointmentsWithMissingOutcomes(request)

      const formattedProject = ProjectPage.projectDetails(project)

      const appointmentList = ProjectPage.appointmentList(appointments.content)

      res.render('projects/show', {
        project: formattedProject,
        appointmentList,
        backPath: paths.projects.index.pattern,
      })
    }
  }
}
