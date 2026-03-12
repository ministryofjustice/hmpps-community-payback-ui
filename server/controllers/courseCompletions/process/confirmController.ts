import type { Request, Response } from 'express'

import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'
import { EteCourseCompletionEventDto } from '../../../@types/shared'

export default class ConfirmController extends BaseController<ConfirmPage> {
  constructor(
    page: ConfirmPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override getStepViewData(
    req: Request,
    _res: Response,
    _courseCompletion: EteCourseCompletionEventDto,
    form?: CourseCompletionForm,
    formId?: string,
  ) {
    return Promise.resolve(this.page.stepViewData(req.params.id, form, formId))
  }
}
