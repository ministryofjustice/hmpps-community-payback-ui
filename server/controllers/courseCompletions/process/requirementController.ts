import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class RequirementController extends BaseController {
  constructor(page: RequirementPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
