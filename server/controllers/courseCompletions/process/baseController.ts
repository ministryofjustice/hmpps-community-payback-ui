import type { Request, Response } from 'express'
import BaseCourseCompletionFormPage from '../../../pages/courseCompletions/process/baseCourseCompletionFormPage'
import CourseCompletionService from '../../../services/courseCompletionService'

export default abstract class BaseController {
  constructor(
    private readonly page: BaseCourseCompletionFormPage<unknown>,
    private readonly courseCompletionService: CourseCompletionService,
  ) {}

  show() {
    return async (_req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: _req.params.id,
      })

      const viewData = this.page.viewData(courseCompletion)
      return res.render(this.page.templatePath, viewData)
    }
  }

  submit() {
    return async (_req: Request, res: Response) => {
      const courseCompletionId = _req.params.id.toString()
      return res.redirect(this.page.nextPath(courseCompletionId))
    }
  }
}
