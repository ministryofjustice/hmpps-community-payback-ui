import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'

export default class ConfirmController extends BaseController<ConfirmPage> {
  constructor(
    page: ConfirmPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override getStepViewData({ req, formData, formId }: StepViewDataParams) {
    return Promise.resolve(this.page.stepViewData(req.params.id, formData, formId))
  }
}
