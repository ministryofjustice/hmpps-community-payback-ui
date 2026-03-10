import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class ProjectController extends BaseController<ProjectPage> {
  constructor(page: ProjectPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
