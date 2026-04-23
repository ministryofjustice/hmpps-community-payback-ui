import { EteCourseCompletionEventDto } from '../@types/shared'
import { CourseCompletionSortField, SortDirection, TableCell, ValidationErrors } from '../@types/user-defined'
import paths from '../paths'
import DateTimeFormats from '../utils/dateTimeUtils'
import HtmlUtils from '../utils/htmlUtils'
import sortHeader from '../utils/sortHeader'

export type CourseCompletionPageInput = {
  provider?: string
  pdu?: string
}

export default class CourseCompletionIndexPage {
  private query: CourseCompletionPageInput

  constructor(query: CourseCompletionPageInput) {
    this.query = query
  }

  validationErrors() {
    const errors: ValidationErrors<CourseCompletionPageInput> = {}

    if (!this.query.provider) {
      errors.provider = { text: 'Select a region' }
    }

    return errors
  }

  courseCompletionTableHeaders(
    sortBy: CourseCompletionSortField | CourseCompletionSortField[],
    sortDirection: SortDirection,
    hrefPrefix: string,
  ): Array<TableCell> {
    return [
      sortHeader<CourseCompletionSortField>(
        'Name',
        ['firstName', 'lastName'],
        sortBy,
        sortDirection,
        hrefPrefix,
        'search-results',
      ),
      {
        text: 'ID',
      },
      sortHeader<CourseCompletionSortField>(
        'Course',
        'courseName',
        sortBy,
        sortDirection,
        hrefPrefix,
        'search-results',
      ),
      sortHeader<CourseCompletionSortField>(
        'Date completed',
        'completionDateTime',
        sortBy,
        sortDirection,
        hrefPrefix,
        'search-results',
      ),
      {
        html: HtmlUtils.getHiddenText('Actions'),
      },
    ]
  }

  courseCompletionTableRows(courseCompletions: Array<EteCourseCompletionEventDto>) {
    return courseCompletions.map(courseCompletion => {
      const viewCourseCompletionPath = paths.courseCompletions.show({ id: courseCompletion.id.toString() })

      const actionContent = `Process ${HtmlUtils.getHiddenText(`${courseCompletion.firstName} ${courseCompletion.lastName}`)}`
      const linkHtml = HtmlUtils.getAnchor(actionContent, viewCourseCompletionPath)

      return [
        { text: `${courseCompletion.firstName} ${courseCompletion.lastName}` },
        { text: courseCompletion.id },
        { text: courseCompletion.courseName },
        { text: DateTimeFormats.isoDateToUIDate(courseCompletion.completionDateTime) },
        { html: linkHtml },
      ]
    })
  }
}
