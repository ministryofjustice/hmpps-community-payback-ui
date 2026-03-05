import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface DateBody {
  'date-day': string
  'date-month': string
  'date-year': string
}

interface Body extends DateBody {
  hours: string
  minutes: string
  contactOutcome: string
  notes?: string
  sensitive?: string
}

export default class OutcomePage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'outcome'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
