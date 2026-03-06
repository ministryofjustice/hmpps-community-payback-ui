import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class ConfirmController extends BaseController {
  constructor(page: ConfirmPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
