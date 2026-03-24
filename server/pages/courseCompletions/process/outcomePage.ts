import GovukFrontendDateInput from '../../../forms/GovukFrontendDateInput'
import { ValidationErrors, YesOrNo } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import { isWholePositiveNumber } from '../../../utils/utils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

type TimePeriods = 'day' | 'month' | 'year'
type DateKeys = `date-${TimePeriods}`

export type OutcomePageBody = {
  [K in DateKeys]?: string
} & {
  hours?: string
  minutes?: string
  contactOutcome?: string
  notes?: string
  isSensitive?: YesOrNo
}

export default class OutcomePage extends BaseCourseCompletionFormPage<OutcomePageBody> {
  protected page: CourseCompletionPage = 'outcome'

  getFormData(formData: CourseCompletionForm, body: OutcomePageBody): CourseCompletionForm {
    return {
      ...formData,
      timeToCredit: { hours: body.hours, minutes: body.minutes },
      'date-day': body['date-day'],
      'date-month': body['date-month'],
      'date-year': body['date-year'],
      notes: body.notes,
      isSensitive: body.isSensitive,
    }
  }

  protected getValidationErrors(body: OutcomePageBody) {
    const timeErrors = this.getTimeErrors(body)
    const dateErrors = this.getDateErrors(body)
    const notesErrors = this.getNotesErrors(body)
    return { ...timeErrors, ...dateErrors, ...notesErrors }
  }

  private getTimeErrors(body: OutcomePageBody) {
    const validationErrors = {} as ValidationErrors<OutcomePageBody>

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

  private getDateErrors(body: OutcomePageBody) {
    // Check if date is complete
    if (!GovukFrontendDateInput.dateIsComplete(body, 'date')) {
      return { 'date-day': { text: 'Appointment date must include a day, month and year' } }
    }

    // Check if date is valid
    if (!GovukFrontendDateInput.dateIsValid(body, 'date')) {
      return { 'date-day': { text: 'Appointment date must be a valid date' } }
    }
    return {}
  }

  private getNotesErrors(body: OutcomePageBody) {
    const validationErrors = {} as ValidationErrors<OutcomePageBody>

    if (body.notes && body.notes.length > 4000) {
      validationErrors.notes = { text: 'Notes must be 4000 characters or less' }
    }

    return validationErrors
  }
}
