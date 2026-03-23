import { UnpaidWorkDetailsDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  requirementNumber?: string
}

export default class RequirementPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'requirement'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    return { ...formData, deliusEventNumber: Number(body.requirementNumber) }
  }

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (!query.requirementNumber) {
      errors.requirementNumber = { text: 'Select a requirement' }
    }

    return errors
  }

  getUnpaidWorkOptions(unpaidWorkDetails: Array<UnpaidWorkDetailsDto>, selectedOptionValue?: number) {
    return unpaidWorkDetails.map(detail => {
      const text = detail.mainOffence.description
      const value = detail.eventNumber

      const totalHoursOrdered = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.requiredMinutes)
      const eteHoursCredited = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.completedEteMinutes)
      const eteHoursRemaining = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(detail.remainingEteMinutes)

      const hintHtml = [
        `Event number: ${detail.eventNumber}`,
        `Sentence date: ${DateTimeFormats.isoDateToUIDate(detail.sentenceDate)}`,
        `Total hours ordered: ${totalHoursOrdered}`,
        `ETE hours credited: ${eteHoursCredited}`,
        `ETE hours remaining: ${eteHoursRemaining}`,
        `Status: ${detail.upwStatus}`,
      ].join('<br>')

      const checked = detail.eventNumber === selectedOptionValue

      return { text, value, hint: { html: hintHtml }, checked }
    })
  }
}
