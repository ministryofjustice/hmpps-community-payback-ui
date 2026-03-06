import type { Request, Response } from 'express'
import BaseCourseCompletionFormPage from '../../../pages/courseCompletions/process/baseCourseCompletionFormPage'
import CourseCompletionService from '../../../services/courseCompletionService'

export default abstract class BaseController {
  constructor(
    protected readonly page: BaseCourseCompletionFormPage<unknown>,
    protected readonly courseCompletionService: CourseCompletionService,
  ) {}

  show() {
    return async (_req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: _req.params.id,
      })

      const viewData = { ...this.page.commonViewData(courseCompletion), ...this.getStepViewData(_req, res) }
      return res.render(this.page.templatePath, viewData)
    }
  }

  submit() {
    return async (_req: Request, res: Response) => {
      const courseCompletionId = _req.params.id.toString()
      const { hasErrors, errorSummary, errors } = this.page.validationErrors(_req.body)

      if (hasErrors) {
        const courseCompletion = await this.courseCompletionService.getCourseCompletion({
          username: res.locals.user.username,
          id: _req.params.id,
        })

        const viewData = {
          ...this.page.commonViewData(courseCompletion),
          ...this.getStepViewData(_req, res),
          errorSummary,
          errors,
        }
        return res.render(this.page.templatePath, viewData)
      }

      return res.redirect(this.page.nextPath(courseCompletionId))
    }
  }

  protected getStepViewData(_req: Request, _res: Response): object {
    return {}
  }
}
