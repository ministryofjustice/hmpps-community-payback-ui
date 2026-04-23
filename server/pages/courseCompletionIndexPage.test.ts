import { CourseCompletionSortField } from '../@types/user-defined'
import paths from '../paths'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import DateTimeFormats from '../utils/dateTimeUtils'
import HtmlUtils from '../utils/htmlUtils'
import sortHeader from '../utils/sortHeader'
import CourseCompletionIndexPage, { CourseCompletionPageInput } from './courseCompletionIndexPage'

describe('CourseCompletionIndexPage', () => {
  describe('validationErrors', () => {
    it('returns an error if the provider is not selected', () => {
      const page = new CourseCompletionIndexPage({} as CourseCompletionPageInput)

      expect(page.validationErrors()).toEqual({
        provider: { text: 'Select a region' },
      })
    })
  })

  describe('courseCompletionTableHeaders', () => {
    it('returns table headers with sorting', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as CourseCompletionPageInput)

      expect(page.courseCompletionTableHeaders(['firstName', 'lastName'], 'asc', '/test')).toEqual([
        sortHeader<CourseCompletionSortField>(
          'Name',
          ['firstName', 'lastName'],
          ['firstName', 'lastName'],
          'asc',
          '/test',
          'search-results',
        ),
        { text: 'ID' },
        sortHeader<CourseCompletionSortField>(
          'Course',
          'courseName',
          ['firstName', 'lastName'],
          'asc',
          '/test',
          'search-results',
        ),
        sortHeader<CourseCompletionSortField>(
          'Date completed',
          'completionDateTime',
          'lastName',
          'asc',
          '/test',
          'search-results',
        ),
        {
          html: HtmlUtils.getHiddenText('Actions'),
        },
      ])
    })
  })

  describe('courseCompletionTableRows', () => {
    const fakeFormattedDate = '20 January 2026'
    const fakeLink = '<a>link</a>'
    const mockHiddenText = '<span></span>'

    beforeEach(() => {
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(fakeFormattedDate)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
      jest.spyOn(HtmlUtils, 'getHiddenText').mockReturnValue(mockHiddenText)
      jest.spyOn(paths.courseCompletions, 'show')
    })

    it('returns course completion results formatted into expected table rows', () => {
      const query = {
        pdu: '1',
        provider: '2',
      }
      const page = new CourseCompletionIndexPage(query)

      const courseCompletion = courseCompletionFactory.build()
      const courseCompletions = [courseCompletion]

      const result = page.courseCompletionTableRows(courseCompletions)
      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        `Process ${mockHiddenText}`,
        `/course-completions/${courseCompletions[0].id}`,
      )

      expect(result).toEqual([
        [
          { text: `${courseCompletion.firstName} ${courseCompletion.lastName}` },
          { text: courseCompletion.id },
          { text: courseCompletion.courseName },
          { text: fakeFormattedDate },
          { html: fakeLink },
        ],
      ])
    })
  })
})
