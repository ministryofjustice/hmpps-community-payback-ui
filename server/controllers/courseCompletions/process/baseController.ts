import type { Request, RequestHandler, Response } from 'express'
import BaseCourseCompletionFormPage from '../../../pages/courseCompletions/process/baseCourseCompletionFormPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import { EteCourseCompletionEventDto } from '../../../@types/shared'

export type StepViewDataParams = {
  req: Request
  res: Response
  courseCompletion: EteCourseCompletionEventDto
  formData?: CourseCompletionForm
  formId?: string
}

export default abstract class BaseController<TPage extends BaseCourseCompletionFormPage<unknown>> {
  constructor(
    protected readonly page: TPage,
    protected readonly courseCompletionService: CourseCompletionService,
    protected readonly courseCompletionFormService: CourseCompletionFormService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: req.params.id,
      })

      const { formId, formData } = await this.getForm(req, res)

      const viewData = {
        ...this.page.viewData(courseCompletion, formId),
        ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId })),
      }
      return res.render(this.page.templatePath, viewData)
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletionId = req.params.id.toString()
      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      const { formId, formData } = await this.getForm(req, res, true)

      if (hasErrors) {
        const courseCompletion = await this.courseCompletionService.getCourseCompletion({
          username: res.locals.user.username,
          id: req.params.id,
        })

        const viewData = {
          ...this.page.viewData(courseCompletion, formId),
          ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId })),
          errorSummary,
          errors,
        }
        return res.render(this.page.templatePath, viewData)
      }

      const updatedFormData = this.page.getFormData(formData, req.body)
      await this.courseCompletionFormService.saveForm(formId, res.locals.user.username, updatedFormData)

      return res.redirect(this.page.nextPath(courseCompletionId, formId))
    }
  }

  protected async getStepViewData(_args: StepViewDataParams): Promise<object> {
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
