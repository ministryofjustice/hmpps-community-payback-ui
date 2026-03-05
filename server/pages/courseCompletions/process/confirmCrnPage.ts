import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  isMatch: boolean
}

export default class ConfirmCrnPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'confirmCrn'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
