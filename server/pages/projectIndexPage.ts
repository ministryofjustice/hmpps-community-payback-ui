import { ParsedQs } from 'qs'
import { PagedModelProjectOutcomeSummaryDto } from '../@types/shared'
import { ProjectsSortField, SortDirection, TableCell, ValidationErrors } from '../@types/user-defined'
import paths from '../paths'
import { ErrorViewData, generateErrorSummary } from '../utils/errorUtils'
import HtmlUtils from '../utils/htmlUtils'
import LocationUtils from '../utils/locationUtils'
import sortHeader from '../utils/sortHeader'
import { pathWithQuery } from '../utils/utils'

const pageInputProperties = ['team', 'provider']

export type ProjectIndexPageInput = { [key in (typeof pageInputProperties)[number]]?: string }

export default class ProjectIndexPage {
  static projectSummaryList(projectOutcomeSummaries: PagedModelProjectOutcomeSummaryDto, query: ProjectIndexPageInput) {
    return projectOutcomeSummaries.content.map(projectSummary => {
      const projectShowPath = `${paths.projects.show({ projectCode: projectSummary.projectCode })}`
      const projectShowPathWithQuery = pathWithQuery(projectShowPath, query)

      const projectLink = HtmlUtils.getAnchor(projectSummary.projectName, projectShowPathWithQuery)

      return [
        { html: projectLink },
        { text: LocationUtils.locationToString(projectSummary.location, { withLineBreaks: false }) },
        { text: projectSummary.numberOfAppointmentsOverdue },
        { text: projectSummary.oldestOverdueAppointmentInDays },
      ]
    })
  }

  static validationErrors(query: ProjectIndexPageInput): ErrorViewData<ProjectIndexPageInput> {
    const errors: ValidationErrors<ProjectIndexPageInput> = {}

    if (!query.provider) {
      errors.provider = { text: 'Choose a region' }
    }

    if (!query.team) {
      errors.team = { text: 'Choose a team' }
    }

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  static objectContainsSearchProperty(queryObject: ParsedQs): boolean {
    return pageInputProperties.some(property => queryObject[property] !== undefined)
  }

  static tableHeaders(
    sortBy: ProjectsSortField | ProjectsSortField[],
    sortDirection: SortDirection,
    hrefPrefix: string,
  ): Array<TableCell> {
    return [
      sortHeader<ProjectsSortField>('Host partner', 'name', sortBy, sortDirection, hrefPrefix, 'search-results'),
      { text: 'Address' },
      sortHeader<ProjectsSortField>(
        'Missing outcomes',
        'overdueOutcomesCount',
        sortBy,
        sortDirection,
        hrefPrefix,
        'search-results',
      ),
      sortHeader<ProjectsSortField>(
        'Days overdue',
        'oldestOverdueInDays',
        sortBy,
        sortDirection,
        hrefPrefix,
        'search-results',
      ),
    ]
  }
}
