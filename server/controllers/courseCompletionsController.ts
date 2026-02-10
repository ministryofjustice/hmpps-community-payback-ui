import type { Request, RequestHandler, Response } from 'express'
import CourseCompletionService from '../services/courseCompletionService'

export default class CourseCompletionsController {
  constructor(private readonly courseCompletionService: CourseCompletionService) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('courseCompletions/index')
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: _req.params.id,
      })

      res.render('courseCompletions/show', {
        courseCompletion,
      })
    }
  }
}
