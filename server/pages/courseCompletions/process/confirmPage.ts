import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  alert: boolean
}

export default class ConfirmCrnPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'confirm'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
