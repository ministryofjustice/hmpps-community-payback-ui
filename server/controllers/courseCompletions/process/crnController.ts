import type { Request, RequestHandler, Response } from 'express'

import { randomUUID } from 'crypto'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import OffenderService from '../../../services/offenderService'

export default class CrnController extends BaseController<CrnPage> {
  constructor(
    page: CrnPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override getStepViewData({ req, courseCompletion, formData }: StepViewDataParams) {
    return Promise.resolve(this.page.stepViewData(courseCompletion, req.body, formData))
  }

  protected override async getForm(
    req: Request,
    res: Response,
    isSubmit: boolean = false,
  ): Promise<{ formId: string; formData: CourseCompletionForm }> {
    let formId = req.query.form?.toString()

    const formData = formId
      ? await this.courseCompletionFormService.getForm(formId, res.locals.user.username)
      : ({} as CourseCompletionForm)

    if (!formId && isSubmit) {
      formId = randomUUID()
    }

    return { formId, formData }
  }

  override submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletionId = req.params.id.toString()
      const { hasErrors: hasValidationErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      const { formId, formData } = await this.getForm(req, res, true)

      if (hasValidationErrors) {
        const courseCompletion = await this.courseCompletionService.getCourseCompletion({
          username: res.locals.user.username,
          id: req.params.id,
        })

        const viewData = {
          ...this.page.viewData(courseCompletion, formId),
          ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId, errors })),
          errorSummary,
          errors,
        }
        return res.render(this.page.templatePath, viewData)
      }

      try {
        await this.offenderService.getOffenderSummary({ username: res.locals.user.username, crn: req.body.crn.trim() })
      } catch (apiError) {
        if (apiError.responseStatus !== 404) {
          throw apiError
        }

        const courseCompletion = await this.courseCompletionService.getCourseCompletion({
          username: res.locals.user.username,
          id: req.params.id,
        })

        const viewData = {
          ...this.page.viewData(courseCompletion, formId),
          ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId, errors: {} })),
          ...this.page.getCrnNotFoundErrors(),
        }
        return res.render(this.page.templatePath, viewData)
      }

      const updatedFormData = this.page.getFormData(formData, req.body)
      await this.courseCompletionFormService.saveForm(formId, res.locals.user.username, updatedFormData)

      return res.redirect(this.page.nextPath(courseCompletionId, formId))
    }
  }
}
