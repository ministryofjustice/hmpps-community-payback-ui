import HistoryPage from '../../../pages/courseCompletions/process/historyPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class HistoryController extends BaseController {
  constructor(page: HistoryPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
