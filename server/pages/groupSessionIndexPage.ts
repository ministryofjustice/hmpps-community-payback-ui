import { ParsedQs } from 'qs'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import { SessionsSortField, SortDirection, TableCell, ValidationErrors } from '../@types/user-defined'
import sortHeader from '../utils/sortHeader'

const groupSessionIndexPageInputProperties = ['team', 'provider', 'date-day', 'date-month', 'date-year']

export type GroupSessionIndexPageInput = { [key in (typeof groupSessionIndexPageInputProperties)[number]]?: string }

interface SearchValues {
  teamCode: string
  startDate: string
  endDate: string
}

interface InputDate {
  key: 'date'
  text: string
}

export default class GroupSessionIndexPage {
  private query: GroupSessionIndexPageInput

  constructor(query: GroupSessionIndexPageInput) {
    this.query = query
  }

  validationErrors() {
    const validationErrors: ValidationErrors<GroupSessionIndexPageInput> = {}

    if (!this.query.provider) {
      validationErrors.provider = { text: 'Choose a region' }
    }

    if (!this.query.team) {
      validationErrors.team = { text: 'Choose a team' }
    }

    return {
      ...validationErrors,
      ...this.checkDateIsAcceptable({ key: 'date', text: 'Date' }),
    }
  }

  items(errors: ValidationErrors<GroupSessionIndexPageInput> = {}) {
    return {
      dateItems: GovukFrontendDateInput.getDateItems(this.query, 'date', Boolean(errors?.['date-day'])),
    }
  }

  searchValues(): SearchValues {
    const date = `${this.query['date-year']}-${this.query['date-month']}-${this.query['date-day']}`
    return {
      startDate: date,
      endDate: date,
      teamCode: this.query.team,
    }
  }

  static tableHeaders(
    sortBy: SessionsSortField | SessionsSortField[],
    sortDirection: SortDirection,
    hrefPrefix: string,
  ): Array<TableCell> {
    return [
      sortHeader<SessionsSortField>('Project', 'projectName', sortBy, sortDirection, hrefPrefix, 'search-results'),
      sortHeader<SessionsSortField>('Date', 'date', sortBy, sortDirection, hrefPrefix, 'search-results'),
      sortHeader<SessionsSortField>('Allocated', 'allocatedCount', sortBy, sortDirection, hrefPrefix, 'search-results'),
      sortHeader<SessionsSortField>('Outcomes', 'outcomeCount', sortBy, sortDirection, hrefPrefix, 'search-results'),
      { text: 'Enforcements' },
    ]
  }

  static objectContainsSearchProperty(queryObject: ParsedQs): boolean {
    return groupSessionIndexPageInputProperties.some(property => queryObject[property] !== undefined)
  }

  private checkDateIsAcceptable(date: InputDate) {
    const errors: ValidationErrors<GroupSessionIndexPageInput> = {}

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
