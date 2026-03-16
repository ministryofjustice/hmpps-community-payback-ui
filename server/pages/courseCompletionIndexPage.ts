import { EteCourseCompletionEventDto } from '../@types/shared'
import { CourseCompletionSortField, SortDirection, TableCell } from '../@types/user-defined'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import paths from '../paths'
import DateTimeFormats from '../utils/dateTimeUtils'
import HtmlUtils from '../utils/htmlUtils'
import sortHeader from '../utils/sortHeader'

type DateFields = 'startDate' | 'endDate'
type TimePeriods = 'day' | 'month' | 'year'
type DateKeys = `${DateFields}-${TimePeriods}`

export type CourseCompletionPageInput = {
  [K in DateKeys]: string
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
    return {}
  }

  items() {
    return {
      startDateItems: GovukFrontendDateInput.getDateItems(this.query, 'startDate', false),
      endDateItems: GovukFrontendDateInput.getDateItems(this.query, 'endDate', false),
    }
  }

  searchValues(): SearchValues {
    return {
      dateFrom: `${this.query['startDate-year']}-${this.query['startDate-month']}-${this.query['startDate-day']}`,
      dateTo: `${this.query['endDate-year']}-${this.query['endDate-month']}-${this.query['endDate-day']}`,
    }
  }

  dateFields(): Partial<CourseCompletionPageInput> {
    return Object.fromEntries(
      Object.entries(this.query).filter(([key]) => key.includes('startDate-') || key.includes('endDate-')),
    )
  }

  courseCompletionTableHeaders(
    sortBy: CourseCompletionSortField,
    sortDirection: SortDirection,
    hrefPrefix: string,
  ): Array<TableCell> {
    return [
      sortHeader<CourseCompletionSortField>('Name', 'lastName', sortBy, sortDirection, hrefPrefix, 'search-results'),
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
        'completionDate',
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

      const actionContent = `View ${HtmlUtils.getHiddenText(`${courseCompletion.firstName} ${courseCompletion.lastName}`)}`
      const linkHtml = HtmlUtils.getAnchor(actionContent, viewCourseCompletionPath)

      return [
        { text: `${courseCompletion.firstName} ${courseCompletion.lastName}` },
        { text: courseCompletion.id },
        { text: courseCompletion.courseName },
        { text: DateTimeFormats.isoDateToUIDate(courseCompletion.completionDate) },
        { html: linkHtml },
      ]
    })
  }
}
