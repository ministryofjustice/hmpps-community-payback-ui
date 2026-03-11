import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

export interface CrnPageBody {
  crn?: string
}

export default class CrnPage extends BaseCourseCompletionFormPage<CrnPageBody> {
  protected page: CourseCompletionPage = 'crn'

  getFormData(formData: CourseCompletionForm, body: CrnPageBody): CourseCompletionForm {
    return { ...formData, crn: body.crn }
  }

  protected getValidationErrors(query: CrnPageBody): ValidationErrors<CrnPageBody> {
    const errors: ValidationErrors<CrnPageBody> = {}

    if (!query.crn) {
      errors.crn = { text: 'Enter a crn' }
    }

    return errors
  }

  stepViewData(body?: CrnPageBody, form?: CourseCompletionForm) {
    return { crn: body?.crn ?? form?.crn }
  }
}
