import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectIndexPage from '../pages/projectIndexPage'
import ProjectService from '../services/projectService'

export default class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

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

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode,
      })

      const formattedProject = ProjectPage.projectDetails(project)

      const appointmentList = ProjectPage.appointmentList([])

      res.render('projects/show', {
        project: formattedProject,
        appointmentList,
      })
    }
  }
}
