import { ValidationErrors } from '../../../@types/user-defined'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

export interface CrnPageBody {
  crn?: string
}

export default class CrnPage extends BaseCourseCompletionFormPage<CrnPageBody> {
  protected page: CourseCompletionPage = 'crn'

  protected getValidationErrors(query: CrnPageBody): ValidationErrors<CrnPageBody> {
    const errors: ValidationErrors<CrnPageBody> = {}

    if (!query.crn) {
      errors.crn = { text: 'Enter a crn' }
    }

    return errors
  }
}
