import ConfirmCrnPage from '../../../pages/courseCompletions/process/confirmCrnPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class ConfirmCrnController extends BaseController {
  constructor(page: ConfirmCrnPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
