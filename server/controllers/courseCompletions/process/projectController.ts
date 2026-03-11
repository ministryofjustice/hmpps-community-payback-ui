import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class ProjectController extends BaseController<ProjectPage> {
  constructor(
    page: ProjectPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }
}
