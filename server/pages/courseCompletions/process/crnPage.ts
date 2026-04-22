import { EteCourseCompletionEventDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

export interface CrnPageBody {
  crn?: string
}

interface ViewData {
  crn?: string
  hintText: string
}

export default class CrnPage extends BaseCourseCompletionFormPage<CrnPageBody> {
  protected page: CourseCompletionPage = 'crn'

  getFormData(formData: CourseCompletionForm, body: CrnPageBody): CourseCompletionForm {
    return { ...formData, crn: body.crn }
  }

  protected getValidationErrors(query: CrnPageBody): ValidationErrors<CrnPageBody> {
    const errors: ValidationErrors<CrnPageBody> = {}

    if (!query.crn) {
      errors.crn = { text: 'Enter a CRN' }
    }

    return errors
  }

  stepViewData(
    courseCompletion: EteCourseCompletionEventDto,
    body?: CrnPageBody,
    form?: CourseCompletionForm,
  ): ViewData {
    return {
      crn: body?.crn ?? form?.crn,
      hintText: this.hintText(courseCompletion),
    }
  }

  private hintText(courseCompletion: EteCourseCompletionEventDto): string {
    const { name } = this.buildPerson(courseCompletion)
    return `Enter ${name}'s CRN to link the Community Campus account with nDelius.`
  }
}
