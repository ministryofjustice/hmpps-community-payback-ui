import { CourseCompletionSortField } from '../@types/user-defined'
import paths from '../paths'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import DateTimeFormats from '../utils/dateTimeUtils'
import HtmlUtils from '../utils/htmlUtils'
import sortHeader from '../utils/sortHeader'
import CourseCompletionIndexPage, { CourseCompletionPageInput } from './courseCompletionIndexPage'

describe('CourseCompletionIndexPage', () => {
  describe('items', () => {
    it('returns date input items', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as CourseCompletionPageInput)

      expect(page.items()).toEqual({
        endDateItems: [
          {
            classes: 'govuk-input--width-2',
            name: 'day',
            value: '13',
          },
          {
            classes: 'govuk-input--width-2',
            name: 'month',
            value: '03',
          },
          {
            classes: 'govuk-input--width-4',
            name: 'year',
            value: '2025',
          },
        ],
        startDateItems: [
          {
            classes: 'govuk-input--width-2',
            name: 'day',
            value: '11',
          },
          {
            classes: 'govuk-input--width-2',
            name: 'month',
            value: '03',
          },
          {
            classes: 'govuk-input--width-4',
            name: 'year',
            value: '2025',
          },
        ],
      })
    })

    it('returns date input items with error classes', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
      } as CourseCompletionPageInput)

      expect(page.items()).toEqual({
        endDateItems: [
          {
            classes: 'govuk-input--width-2 govuk-input--error',
            name: 'day',
            value: '',
          },
          {
            classes: 'govuk-input--width-2 govuk-input--error',
            name: 'month',
            value: '',
          },
          {
            classes: 'govuk-input--width-4 govuk-input--error',
            name: 'year',
            value: '',
          },
        ],
        startDateItems: [
          {
            classes: 'govuk-input--width-2',
            name: 'day',
            value: '11',
          },
          {
            classes: 'govuk-input--width-2',
            name: 'month',
            value: '03',
          },
          {
            classes: 'govuk-input--width-4',
            name: 'year',
            value: '2025',
          },
        ],
      })
    })
  })

  describe('searchValues', () => {
    it('returns search values in correct format', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as CourseCompletionPageInput)

      expect(page.searchValues()).toEqual({
        dateFrom: '2025-03-11',
        dateTo: '2025-03-13',
      })
    })
  })

  describe('validationErrors', () => {
    it('returns an error if the date is incomplete', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        // year is missing
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as CourseCompletionPageInput)

      expect(page.validationErrors()).toEqual({
        'startDate-day': { text: 'From date must include a day, month and year' },
      })
    })

    it('returns an error if the date is invalid', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '13', // invalid month
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': 'abc', // invalid year
      } as CourseCompletionPageInput)

      expect(page.validationErrors()).toEqual({
        'startDate-day': { text: 'From date must be a valid date' },
        'endDate-day': { text: 'To date must be a valid date' },
      })
    })
  })

  describe('dateFields', () => {
    it('returns only date related fields', () => {
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
        otherField: 'should be filtered out',
      } as CourseCompletionPageInput)

      expect(page.dateFields()).toEqual({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
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

      expect(page.courseCompletionTableHeaders('lastName', 'asc', '/test')).toEqual([
        sortHeader<CourseCompletionSortField>('Name', 'lastName', 'lastName', 'asc', '/test', 'search-results'),
        { text: 'ID' },
        sortHeader<CourseCompletionSortField>('Course', 'courseName', 'lastName', 'asc', '/test', 'search-results'),
        sortHeader<CourseCompletionSortField>(
          'Date completed',
          'completionDate',
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
      const page = new CourseCompletionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as CourseCompletionPageInput)

      const courseCompletion = courseCompletionFactory.build()
      const courseCompletions = [courseCompletion]

      const result = page.courseCompletionTableRows(courseCompletions)
      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        `View ${mockHiddenText}`,
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
