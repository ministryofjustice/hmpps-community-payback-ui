import type { Request, Response } from 'express'

import { randomUUID } from 'crypto'
import CrnPage, { CrnPageBody } from '../../../pages/courseCompletions/process/crnPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'

export default class CrnController extends BaseController<CrnPage> {
  constructor(
    page: CrnPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override getStepViewData(
    req: Request,
    _: Response,
    form?: CourseCompletionForm,
    _formId?: string,
  ): CrnPageBody {
    return this.page.stepViewData(req.body, form)
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
}
