import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  requirementNumber: string
}

export default class RequirementPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'requirement'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
