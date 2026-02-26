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
})
