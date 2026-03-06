import type { Request, Response } from 'express'

import CrnPage, { CrnPageBody } from '../../../pages/courseCompletions/process/crnPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class CrnController extends BaseController {
  constructor(page: CrnPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }

  protected override getStepViewData(req: Request, _: Response): object {
    return { crn: req.body.crn ?? 'hhhh' }
  }
}
