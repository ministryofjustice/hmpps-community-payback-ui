import type { Request, Response } from 'express'

import { EteCourseCompletionEventDto } from '../../../@types/shared'
import PersonPage, { PersonPageViewData } from '../../../pages/courseCompletions/process/personPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseController from './baseController'

export default class PersonController extends BaseController<PersonPage> {
  constructor(
    page: PersonPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override getStepViewData(
    _req: Request,
    _: Response,
    courseCompletion: EteCourseCompletionEventDto,
    _form?: CourseCompletionForm,
    _formId?: string,
  ): PersonPageViewData {
    return this.page.stepViewData(courseCompletion)
  }
}
