import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectIndexPage from '../pages/projectIndexPage'
import ProjectService from '../services/projectService'
import AppointmentService from '../services/appointmentService'
import paths from '../paths'

export default class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly appointmentService: AppointmentService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const projectSummaryList = ProjectIndexPage.projectSummaryList([])

      res.render('projects/index', {
        projectSummaryList,
        showNoResultsMessage: projectSummaryList.length === 0,
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

      const appointmentList = ProjectPage.appointmentList(appointments.content)

      res.render('projects/show', {
        project: formattedProject,
        appointmentList,
        backPath: paths.projects.index.pattern,
      })
    }
  }
}
