import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectService from '../services/projectService'
import ProviderService from '../services/providerService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'

export default class ProjectsController {
  private readonly providerCode = 'N56'

  constructor(
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly appointmentService: AppointmentService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamItems = await this.getTeams(this.providerCode, res)

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

  private async getTeams(providerCode: string, res: Response, teamCode: string | undefined = undefined) {
    const teams = await this.providerService.getTeams(providerCode, res.locals.user.username)

    const teamItems = teams.providers.map(team => {
      const selected = teamCode ? team.code === teamCode : undefined

      return {
        value: team.code,
        text: team.name,
        selected,
      }
    })
    return teamItems
  }
}
