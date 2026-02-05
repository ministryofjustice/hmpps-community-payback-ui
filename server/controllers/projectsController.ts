import type { Request, RequestHandler, Response } from 'express'
import ProjectPage from '../pages/projectPage'
import ProjectIndexPage from '../pages/projectIndexPage'

export default class ProjectsController {
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
      const project = {
        name: 'Age UK',
        openingTimes: '09:00 - 17:30',
        address: "20 St Ann's Square, Mancherster, M2 7HG",
        primaryContact: {
          nameAndJobTitle: 'Karen Downing, General manager',
          email: 'karen@ageuk.co.uk',
          phone: '0161 833 3944',
        },
      }

      const appointmentList = ProjectPage.appointmentList([])

      res.render('projects/show', {
        project,
        appointmentList,
      })
    }
  }
}
