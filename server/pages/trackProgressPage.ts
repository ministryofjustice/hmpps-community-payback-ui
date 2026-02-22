import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import { ValidationErrors } from '../@types/user-defined'
import DateTimeFormats from '../utils/dateTimeUtils'

type DateFields = 'startDate' | 'endDate'
type TimePeriods = 'day' | 'month' | 'year'
type DateKeys = `${DateFields}-${TimePeriods}`

export type TrackProgressPageInput = {
  [K in DateKeys]: string
} & {
  team: string
}

interface SearchValues {
  teamCode: string
  startDate: string
  endDate: string
}

interface InputDate {
  key: DateFields
  text: string
}

export default class TrackProgressPage {
  private query: TrackProgressPageInput

  constructor(query: TrackProgressPageInput) {
    this.query = query
  }

  validationErrors() {
    const validationErrors: ValidationErrors<TrackProgressPageInput> = {}

    if (!this.query.team) {
      validationErrors.team = { text: 'Choose a team' }
    }

    return {
      ...validationErrors,
      ...this.checkDateIsAcceptable({ key: 'startDate', text: 'From date' }),
      ...this.checkDateIsAcceptable({ key: 'endDate', text: 'To date' }),
      ...this.checkEndDateIsWithin7DaysOfStartDate(),
    }
  }

  items(errors: ValidationErrors<TrackProgressPageInput> = {}) {
    return {
      startDateItems: GovukFrontendDateInput.getDateItems(this.query, 'startDate', Boolean(errors?.['startDate-day'])),
      endDateItems: GovukFrontendDateInput.getDateItems(this.query, 'endDate', Boolean(errors?.['endDate-day'])),
    }
  }

  searchValues(): SearchValues {
    return {
      startDate: `${this.query['startDate-year']}-${this.query['startDate-month']}-${this.query['startDate-day']}`,
      endDate: `${this.query['endDate-year']}-${this.query['endDate-month']}-${this.query['endDate-day']}`,
      teamCode: this.query.team,
    }
  }

  private checkDateIsAcceptable(date: InputDate) {
    const errors: ValidationErrors<TrackProgressPageInput> = {}

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

  private checkEndDateIsWithin7DaysOfStartDate() {
    const errors: ValidationErrors<TrackProgressPageInput> = {}

    if (
      GovukFrontendDateInput.dateIsValid(this.query, 'startDate') &&
      GovukFrontendDateInput.dateIsValid(this.query, 'endDate')
    ) {
      const startDateFromInputs = DateTimeFormats.dateAndTimeInputsToIsoString(this.query, 'startDate')
      const endDateFromInputs = DateTimeFormats.dateAndTimeInputsToIsoString(this.query, 'endDate')

      if (!DateTimeFormats.datesAreWithinNDays(startDateFromInputs.startDate, endDateFromInputs.endDate, 7)) {
        errors['endDate-day'] = { text: 'Time period entered must be 7 days or less' }
      }
    }
    return errors
  }
}
