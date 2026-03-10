import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class RequirementController extends BaseController<RequirementPage> {
  constructor(page: RequirementPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
