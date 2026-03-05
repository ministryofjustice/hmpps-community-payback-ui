import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  teamCode: string
  projectCode: string
}

export default class ProjectPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'project'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
