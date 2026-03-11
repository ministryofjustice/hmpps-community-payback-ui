import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class OutcomeController extends BaseController<OutcomePage> {
  constructor(
    page: OutcomePage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }
}
