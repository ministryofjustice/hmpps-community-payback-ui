import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import { ValidationErrors } from '../@types/user-defined'

export type TrackProgressPageInput = {
  team: string
  'startDate-day': string
  'startDate-month': string
  'startDate-year': string
  'endDate-day': string
  'endDate-month': string
  'endDate-year': string
}

interface SearchValues {
  teamCode: string
  startDate: string
  endDate: string
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

    if (!GovukFrontendDateInput.dateIsComplete(this.query, 'startDate')) {
      validationErrors['startDate-day'] = { text: 'From date must include a day, month and year' }
    } else {
      const dateItems = GovukFrontendDateInput.getStructuredDate(this.query, 'startDate')
      this.query = {
        ...this.query,
        'startDate-day': dateItems.day,
        'startDate-month': dateItems.month,
      }
      if (!GovukFrontendDateInput.dateIsValid(this.query, 'startDate')) {
        validationErrors['startDate-day'] = { text: 'From date must be a valid date' }
      }
    }
    if (!GovukFrontendDateInput.dateIsComplete(this.query, 'endDate')) {
      validationErrors['endDate-day'] = { text: 'To date must include a day, month and year' }
    } else {
      const dateItems = GovukFrontendDateInput.getStructuredDate(this.query, 'endDate')
      this.query = {
        ...this.query,
        'endDate-day': dateItems.day,
        'endDate-month': dateItems.month,
      }
      if (!GovukFrontendDateInput.dateIsValid(this.query, 'endDate')) {
        validationErrors['endDate-day'] = { text: 'To date must be a valid date' }
      }
    }

    return validationErrors
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
      startDate: `${this.query['startDate-year']}-${this.query['startDate-month']}-${this.query['startDate-day']}`,
      endDate: `${this.query['endDate-year']}-${this.query['endDate-month']}-${this.query['endDate-day']}`,
      teamCode: this.query.team,
    }
  }
}
