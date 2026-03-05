import { ValidationErrors } from '../../../@types/user-defined'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  crn?: string
}

export default class CrnPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'crn'

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (!query.crn) {
      errors.crn = { text: 'Enter a crn' }
    }

    return errors
  }
}
