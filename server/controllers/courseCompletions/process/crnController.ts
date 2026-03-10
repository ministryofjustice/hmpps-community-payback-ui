import type { Request, Response } from 'express'

import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class CrnController extends BaseController<CrnPage> {
  constructor(page: CrnPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }

  protected override getStepViewData(req: Request, _: Response): object {
    return this.page.stepViewData(req.body)
  }
}
