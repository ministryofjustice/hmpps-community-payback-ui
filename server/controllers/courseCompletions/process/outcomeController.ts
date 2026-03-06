import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class OutcomeController extends BaseController<OutcomePage> {
  constructor(page: OutcomePage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
