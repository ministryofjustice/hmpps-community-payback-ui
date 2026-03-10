import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  isMatch: boolean
}

export default class PersonPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'person'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
