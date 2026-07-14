import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  deliusEventNumber?: string
}

export default class RequirementPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'requirement'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    return { ...formData, deliusEventNumber: Number(body.deliusEventNumber) }
  }

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (!query.deliusEventNumber) {
      errors.deliusEventNumber = { text: 'Select a requirement' }
    }

    return errors
  }
}
