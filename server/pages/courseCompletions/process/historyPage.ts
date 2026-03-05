import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  canCreditHours: boolean
}

export default class HistoryPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'history'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
