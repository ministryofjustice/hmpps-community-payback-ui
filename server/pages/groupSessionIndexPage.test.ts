import GroupSessionIndexPage, { GroupSessionIndexPageInput } from './groupSessionIndexPage'

describe('GroupSessionIndexPage', () => {
  describe('validationErrors', () => {
    it('returns errors when date is empty', () => {
      const page = new GroupSessionIndexPage({} as GroupSessionIndexPageInput)

      expect(page.validationErrors()).toEqual({
        team: { text: 'Choose a team' },
        'startDate-day': { text: 'From date must include a day, month and year' },
        'endDate-day': { text: 'To date must include a day, month and year' },
      })
    })

    it('returns errors when date is invalid', () => {
      const page = new GroupSessionIndexPage({
        'startDate-day': '11',
        'startDate-month': '13',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as GroupSessionIndexPageInput)

      expect(page.validationErrors()).toEqual({
        team: { text: 'Choose a team' },
        'startDate-day': { text: 'From date must be a valid date' },
      })
    })

    it('returns an error when date range is greater than 7 days', () => {
      const page = new GroupSessionIndexPage({
        'startDate-day': '11',
        'startDate-month': '12',
        'startDate-year': '2025',
        'endDate-day': '20',
        'endDate-month': '12',
        'endDate-year': '2025',
      } as GroupSessionIndexPageInput)

      expect(page.validationErrors()).toEqual({
        team: { text: 'Choose a team' },
        'endDate-day': { text: 'Time period entered must be 7 days or less' },
      })
    })
  })

  describe('items', () => {
    it('returns date input items', () => {
      const page = new GroupSessionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
        'endDate-day': '13',
        'endDate-month': '03',
        'endDate-year': '2025',
      } as GroupSessionIndexPageInput)

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
      const page = new GroupSessionIndexPage({
        'startDate-day': '11',
        'startDate-month': '03',
        'startDate-year': '2025',
      } as GroupSessionIndexPageInput)

      const errors = { 'endDate-day': { text: 'some error' } }

      expect(page.items(errors)).toEqual({
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
    it('returns query items formatted for API request', () => {
      const page = new GroupSessionIndexPage({
        team: 'XR123',
        'startDate-day': '07',
        'startDate-month': '07',
        'startDate-year': '2024',
        'endDate-day': '08',
        'endDate-month': '08',
        'endDate-year': '2025',
      })

      const result = page.searchValues()

      expect(result).toEqual({
        startDate: '2024-07-07',
        endDate: '2025-08-08',
        teamCode: 'XR123',
      })
    })
  })
})
