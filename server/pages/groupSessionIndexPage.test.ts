import GroupSessionIndexPage, { GroupSessionIndexPageInput } from './groupSessionIndexPage'

describe('GroupSessionIndexPage', () => {
  describe('validationErrors', () => {
    it('returns errors when fields are empty', () => {
      const page = new GroupSessionIndexPage({} as GroupSessionIndexPageInput)

      expect(page.validationErrors()).toEqual({
        team: { text: 'Choose a team' },
        provider: { text: 'Choose a region' },
        'date-day': { text: 'Date must include a day, month and year' },
      })
    })

    it('returns errors when date is invalid', () => {
      const page = new GroupSessionIndexPage({
        'date-day': '11',
        'date-month': '13',
        'date-year': '2025',
        provider: 'x',
      } as GroupSessionIndexPageInput)

      expect(page.validationErrors()).toEqual({
        team: { text: 'Choose a team' },
        'date-day': { text: 'Date must be a valid date' },
      })
    })
  })

  describe('items', () => {
    it('returns date input items', () => {
      const page = new GroupSessionIndexPage({
        'date-day': '11',
        'date-month': '03',
        'date-year': '2025',
      } as GroupSessionIndexPageInput)

      expect(page.items()).toEqual({
        dateItems: [
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
        'date-day': '11',
        'date-month': '03',
        'date-year': '2025',
      } as GroupSessionIndexPageInput)

      const errors = { 'date-day': { text: 'some error' } }

      expect(page.items(errors)).toEqual({
        dateItems: [
          {
            classes: 'govuk-input--width-2 govuk-input--error',
            name: 'day',
            value: '11',
          },
          {
            classes: 'govuk-input--width-2 govuk-input--error',
            name: 'month',
            value: '03',
          },
          {
            classes: 'govuk-input--width-4 govuk-input--error',
            name: 'year',
            value: '2025',
          },
        ],
      })
    })
  })

  describe('searchValues', () => {
    it('returns query items formatted for API request with same date for startDate and endDate', () => {
      const page = new GroupSessionIndexPage({
        team: 'XR123',
        'date-day': '07',
        'date-month': '07',
        'date-year': '2024',
      })

      const result = page.searchValues()

      expect(result).toEqual({
        startDate: '2024-07-07',
        endDate: '2024-07-07',
        teamCode: 'XR123',
      })
    })
  })

  describe('objectContainsSearchProperty', () => {
    describe('object contains property', () => {
      it.each([
        [{ team: 'TEAM1' }],
        [{ provider: 'PROVIDER1' }],
        [{ 'date-day': '01' }],
        [{ 'date-month': '01' }],
        [{ 'date-year': '2024' }],
        [{ team: 'TEAM1', provider: 'PROVIDER1', 'date-day': '01' }],
        [
          {
            team: 'TEAM1',
            provider: 'PROVIDER1',
            'date-day': '01',
            'date-month': '01',
            'date-year': '2024',
          },
        ],
        [{ team: '' }],
        [{ 'date-day': '31' }],
      ])('should return true given %s', queryObject => {
        const result = GroupSessionIndexPage.objectContainsSearchProperty(queryObject)
        expect(result).toBe(true)
      })
    })

    describe('object does not contain property', () => {
      it.each([
        [{}],
        [{ other: 'value' }],
        [{ notASearchProperty: 'value', anotherOne: 'test' }],
        [{ team: undefined }],
        [{ provider: undefined, 'date-day': undefined }],
      ])('should return false given %s', queryObject => {
        const result = GroupSessionIndexPage.objectContainsSearchProperty(queryObject)
        expect(result).toBe(false)
      })
    })
  })
})
