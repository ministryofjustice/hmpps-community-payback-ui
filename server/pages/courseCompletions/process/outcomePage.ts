import GovukFrontendDateInput from '../../../forms/GovukFrontendDateInput'
import { ValidationErrors, YesOrNo } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'
import { UnpaidWorkDetailsDto } from '../../../@types/shared'
import UnpaidWorkUtils, { UnpaidWorkHoursDetails } from '../../../utils/unpaidWorkUtils'
import HoursAndMinutesInput, { ObjectWithHoursAndMinutes } from '../../../forms/hoursAndMinutesInput'

type TimePeriods = 'day' | 'month' | 'year'
type DateKeys = `date-${TimePeriods}`

export type OutcomePageBody = {
  [K in DateKeys]?: string
} & {
  contactOutcome?: string
  notes?: string
  isSensitive?: YesOrNo
} & ObjectWithHoursAndMinutes

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

  requirementDetailsItems(
    unpaidWorkRequirementDetails: UnpaidWorkDetailsDto[],
    deliusEventNumber?: number,
  ): UnpaidWorkHoursDetails | undefined {
    const selectedRequirement = unpaidWorkRequirementDetails.find(detail => detail.eventNumber === deliusEventNumber)
    if (selectedRequirement) {
      return UnpaidWorkUtils.unpaidWorkHoursDetails(selectedRequirement, true)
    }
    return undefined
  }

  protected getValidationErrors(body: OutcomePageBody) {
    const timeErrors = HoursAndMinutesInput.validationErrors(body, 'credited hours')
    const dateErrors = this.getDateErrors(body)
    const notesErrors = this.getNotesErrors(body)
    return { ...timeErrors, ...dateErrors, ...notesErrors }
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
