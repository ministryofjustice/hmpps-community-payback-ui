import type { Request, RequestHandler, Response } from 'express'

export default class ProjectsController {
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

      res.render('projects/show', {
        project,
      })
    }
  }
}
