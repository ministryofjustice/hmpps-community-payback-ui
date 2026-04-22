import { Request, RequestHandler, Response } from 'express'
import { randomUUID } from 'node:crypto'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import paths from '../../../paths'
import { catchApiValidationErrorOrPropagate } from '../../../utils/errorUtils'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'
import OffenderService from '../../../services/offenderService'
import { pathWithQuery } from '../../../utils/utils'

export default class UnableToCreditTimeController extends BaseController<UnableToCreditTimePage> {
  constructor(
    page: UnableToCreditTimePage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({
    req,
    formData,
  }: StepViewDataParams): Promise<{ unableToCreditTimeNotes: string }> {
    const unableToCreditTimeNotes = this.getPropertyValue({ propertyName: 'unableToCreditTimeNotes', req, formData })
    return { unableToCreditTimeNotes }
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

  override show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: req.params.id,
      })

      const { formId, formData } = await this.getForm(req, res)

      const viewData = {
        ...this.page.viewData(courseCompletion, formId, undefined, req),
        ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId, errors: {} })),
      }
      return res.render(this.page.templatePath, viewData)
    }
  }

  override submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletionId = req.params.id.toString()
      const { formData, formId } = await this.getForm(req, res, true)
      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      if (hasErrors) {
        const courseCompletion = await this.courseCompletionService.getCourseCompletion({
          username: res.locals.user.username,
          id: courseCompletionId,
        })

        const viewData = {
          ...this.page.viewData(courseCompletion, formId, undefined, req),
          ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId, errors })),
          errorSummary,
          errors,
        }
        return res.render(this.page.templatePath, viewData)
      }

      const { offender } = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn: formData.crn,
      })

      const updatedFormData = this.page.getFormData(formData, req.body)
      const payload = this.page.requestBody(updatedFormData)

      try {
        await this.courseCompletionService.saveResolution(
          { id: courseCompletionId, username: res.locals.user.username },
          payload,
        )
        const successMessage = this.page.successMessage(offender)

        req.flash('success', successMessage)

        return res.redirect(
          pathWithQuery(paths.courseCompletions.index({}), {
            ...(formData.originalSearch ?? {}),
          }),
        )
      } catch (error) {
        return catchApiValidationErrorOrPropagate(req, res, error, this.page.updatePath({ courseCompletionId, formId }))
      }
    }
  }
}
