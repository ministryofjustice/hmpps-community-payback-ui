import type { Request, RequestHandler, Response } from 'express'
import BaseCourseCompletionFormPage from '../../../pages/courseCompletions/process/baseCourseCompletionFormPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import { EteCourseCompletionEventDto } from '../../../@types/shared'

export default abstract class BaseController<TPage extends BaseCourseCompletionFormPage<unknown>> {
  constructor(
    protected readonly page: TPage,
    protected readonly courseCompletionService: CourseCompletionService,
    protected readonly courseCompletionFormService: CourseCompletionFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: _req.params.id,
      })

      const { formId, formData } = await this.getForm(_req, res)

      const viewData = {
        ...this.page.viewData(courseCompletion, formId),
        ...(await this.getStepViewData(_req, res, courseCompletion, formData, formId)),
      }
      return res.render(this.page.templatePath, viewData)
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const courseCompletionId = _req.params.id.toString()
      const { hasErrors, errorSummary, errors } = this.page.validationErrors(_req.body)

      const { formId, formData } = await this.getForm(_req, res, true)

      if (hasErrors) {
        const courseCompletion = await this.courseCompletionService.getCourseCompletion({
          username: res.locals.user.username,
          id: _req.params.id,
        })

        const viewData = {
          ...this.page.viewData(courseCompletion, formId),
          ...(await this.getStepViewData(_req, res, courseCompletion, formData, formId)),
          errorSummary,
          errors,
        }
        return res.render(this.page.templatePath, viewData)
      }

      const updatedFormData = this.page.getFormData(formData, _req.body)
      await this.courseCompletionFormService.saveForm(formId, res.locals.user.username, updatedFormData)

      return res.redirect(this.page.nextPath(courseCompletionId, formId))
    }
  }

  protected async getStepViewData(
    _req: Request,
    _res: Response,
    _courseCompletion: EteCourseCompletionEventDto,
    _form?: CourseCompletionForm,
    _formId?: string,
  ): Promise<object> {
    return {}
  }

  protected async getForm(
    req: Request,
    res: Response,
    _isSubmit: boolean = false,
  ): Promise<{ formId?: string; formData: CourseCompletionForm }> {
    const formId = req.query.form.toString()

    const formData = await this.courseCompletionFormService.getForm(formId, res.locals.user.username)

    return { formId, formData }
  }
}
