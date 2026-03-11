import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class RequirementController extends BaseController<RequirementPage> {
  constructor(
    page: RequirementPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }
}
