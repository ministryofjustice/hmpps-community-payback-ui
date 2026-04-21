import { CourseCompletionResolutionDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  unableToCreditTimeNotes?: string
}

export default class UnableToCreditTimePage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'unableToCreditTime'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    return {
      ...formData,
      unableToCreditTimeNotes: body.unableToCreditTimeNotes,
    }
  }

  requestBody(formData: CourseCompletionForm): CourseCompletionResolutionDto {
    return {
      type: 'DONT_CREDIT_TIME',
      crn: formData.crn,
      dontCreditTimeDetails: {
        notes: formData.unableToCreditTimeNotes,
      },
    }
  }

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (query.unableToCreditTimeNotes && query.unableToCreditTimeNotes.length > 250) {
      errors.unableToCreditTimeNotes = { text: 'Notes must be 250 characters or less' }
    }

    return errors
  }

  override updatePath({ courseCompletionId, formId }: { courseCompletionId: string; formId?: string }): string {
    return this.pathWithFormId(paths.courseCompletions.unableToCreditTime({ id: courseCompletionId }), formId)
  }

  protected override backPath(): string {
    // TODO
    return ''
  }
}
