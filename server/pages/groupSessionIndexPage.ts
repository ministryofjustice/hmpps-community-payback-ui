import { ParsedQs } from 'qs'
import MojDateInput from '../forms/mojDateInput'
import { SessionsSortField, SortDirection, TableCell, ValidationErrors } from '../@types/user-defined'
import sortHeader from '../utils/sortHeader'

const groupSessionIndexPageInputProperties = ['team', 'provider', 'date']

export type GroupSessionIndexPageInput = { [key in (typeof groupSessionIndexPageInputProperties)[number]]?: string }

interface SearchValues {
  teamCode: string
  startDate: string
  endDate: string
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

    const dateError = MojDateInput.validate(this.query.date)

    if (dateError) {
      validationErrors.date = dateError
    }

    return validationErrors
  }

  items() {
    return {
      date: this.query.date,
    }
  }

  searchValues(): SearchValues {
    const date = MojDateInput.toIsoDate(this.query.date)
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
}
