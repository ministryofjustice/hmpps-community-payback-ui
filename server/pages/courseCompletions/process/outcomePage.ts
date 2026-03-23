import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import { isWholePositiveNumber } from '../../../utils/utils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface DateBody {
  'date-day'?: string
  'date-month'?: string
  'date-year'?: string
}

interface Body extends DateBody {
  hours?: string
  minutes?: string
  contactOutcome?: string
  notes?: string
  sensitive?: string
}

export default class OutcomePage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'outcome'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    return { ...formData, timeToCredit: { hours: body.hours, minutes: body.minutes } }
  }

  protected getValidationErrors(body: Body) {
    return this.getTimeErrors(body)
  }

  private getTimeErrors(body: Body) {
    const validationErrors = {} as ValidationErrors<Body>

    if (!body.hours && !body.minutes) {
      validationErrors.hours = { text: 'Enter hours and minutes for credited hours' }
      return validationErrors
    }

    if (body.hours) {
      if (!isWholePositiveNumber(body.hours)) {
        validationErrors.hours = { text: 'Enter valid hours for credited hours, for example 2' }
      }
    }

    if (body.minutes) {
      if (!isWholePositiveNumber(body.minutes) || Number(body.minutes) > 59) {
        validationErrors.minutes = { text: 'Enter valid minutes for credited hours, for example 30' }
      }
    }

    return validationErrors
  }
}
