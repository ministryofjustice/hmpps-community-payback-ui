import type { Request, RequestHandler, Response } from 'express'

export default class CourseCompletionsController {
  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('courseCompletions/index')
    }
  }
}
