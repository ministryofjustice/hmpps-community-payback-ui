import { ValidationErrors } from '../@types/user-defined'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'

type DateFields = 'startDate' | 'endDate'
type TimePeriods = 'day' | 'month' | 'year'
type DateKeys = `${DateFields}-${TimePeriods}`

export type CourseCompletionPageInput = {
  [K in DateKeys]: string
}

interface InputDate {
  key: DateFields
  text: string
}

interface SearchValues {
  dateFrom: string
  dateTo: string
}

export default class CourseCompletionIndexPage {
  private query: CourseCompletionPageInput

  constructor(query: CourseCompletionPageInput) {
    this.query = query
  }

  validationErrors() {
    return {
      ...this.checkDateIsValid({ key: 'startDate', text: 'From date' }),
      ...this.checkDateIsValid({ key: 'endDate', text: 'To date' }),
    }
  }

  items() {
    const errors = this.validationErrors()

    return {
      startDateItems: GovukFrontendDateInput.getDateItems(this.query, 'startDate', Boolean(errors?.['startDate-day'])),
      endDateItems: GovukFrontendDateInput.getDateItems(this.query, 'endDate', Boolean(errors?.['endDate-day'])),
    }
  }

  searchValues(): SearchValues {
    return {
      dateFrom: `${this.query['startDate-year']}-${this.query['startDate-month']}-${this.query['startDate-day']}`,
      dateTo: `${this.query['endDate-year']}-${this.query['endDate-month']}-${this.query['endDate-day']}`,
    }
  }

  private checkDateIsValid(date: InputDate) {
    const errors: ValidationErrors<CourseCompletionPageInput> = {}

    if (!GovukFrontendDateInput.dateIsComplete(this.query, date.key)) {
      errors[`${date.key}-day`] = { text: `${date.text} must include a day, month and year` }
    } else {
      const dateItems = GovukFrontendDateInput.getStructuredDate(this.query, date.key)
      this.query = {
        ...this.query,
        [`${date.key}-day`]: dateItems.day,
        [`${date.key}-month`]: dateItems.month,
      }
      if (!GovukFrontendDateInput.dateIsValid(this.query, date.key)) {
        errors[`${date.key}-day`] = { text: `${date.text} must be a valid date` }
      }
    }
    return errors
  }
}
