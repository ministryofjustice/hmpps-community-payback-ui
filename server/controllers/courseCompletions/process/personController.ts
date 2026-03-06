import PersonPage from '../../../pages/courseCompletions/process/personPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class PersonController extends BaseController<PersonPage> {
  constructor(page: PersonPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
