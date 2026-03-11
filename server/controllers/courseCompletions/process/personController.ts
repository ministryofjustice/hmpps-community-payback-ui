import PersonPage from '../../../pages/courseCompletions/process/personPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import BaseController from './baseController'

export default class PersonController extends BaseController<PersonPage> {
  constructor(
    page: PersonPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }
}
