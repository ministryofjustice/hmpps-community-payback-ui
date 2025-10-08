import { ObjectWithDateParts } from '../@types/user-defined'
import GovukFrontendDateInput from './GovukFrontendDateInput'

describe('GovUkFrontendDateInput', () => {
  describe('getDateItems', () => {
    it('returns a list of date items', () => {
      const query = {
        'date-day': '09',
        'date-month': '10',
        'date-year': '2025',
        'another-day': '22',
      }

      expect(GovukFrontendDateInput.getDateItems(query, 'date')).toEqual([
        {
          name: 'day',
          classes: 'govuk-input--width-2',
          value: '09',
        },
        {
          name: 'month',
          classes: 'govuk-input--width-2',
          value: '10',
        },
        {
          name: 'year',
          classes: 'govuk-input--width-4',
          value: '2025',
        },
      ])
    })

    it('includes error styles when `hasError` is true', () => {
      const query = {
        'date-day': '09',
        'date-month': '10',
        'date-year': '2025',
        'another-day': '22',
      }

      const hasError = true

      expect(GovukFrontendDateInput.getDateItems(query, 'date', hasError)).toEqual([
        {
          name: 'day',
          classes: 'govuk-input--width-2 govuk-input--error',
          value: '09',
        },
        {
          name: 'month',
          classes: 'govuk-input--width-2 govuk-input--error',
          value: '10',
        },
        {
          name: 'year',
          classes: 'govuk-input--width-4 govuk-input--error',
          value: '2025',
        },
      ])
    })
  })

  describe('dateIsComplete', () => {
    it('returns true if the date is complete', () => {
      const date = {
        'field-day': '12',
        'field-month': '1',
        'field-year': '2022',
      }

      expect(GovukFrontendDateInput.dateIsComplete(date, 'field')).toEqual(true)
    })

    it('returns false if the date is blank', () => {
      const date = {
        'field-day': '',
        'field-month': '',
        'field-year': '',
      }

      expect(GovukFrontendDateInput.dateIsComplete(date, 'field')).toEqual(false)
    })

    it('returns false if a partial date is entered', () => {
      const date = {
        'field-day': '12',
        'field-month': '1',
        'field-year': '',
      }

      expect(GovukFrontendDateInput.dateIsComplete(date, 'field')).toEqual(false)
    })

    it('ignores irrelevant fields', () => {
      const date = {
        'field-day': '12',
        'field-month': '1',
        'field-year': '2022',
        'otherField-day': undefined,
        'otherField-month': undefined,
        'otherField-year': undefined,
      } as ObjectWithDateParts<'field'>

      expect(GovukFrontendDateInput.dateIsComplete(date, 'field')).toEqual(true)
    })
  })

  describe('dateIsValid', () => {
    it('returns true when the date is valid', () => {
      const date = {
        'date-year': '2022',
        'date-month': '12',
        'date-day': '11',
      }

      const result = GovukFrontendDateInput.dateIsValid(date, 'date')

      expect(result).toEqual(true)
    })

    it('returns false when the date is invalid', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '99',
        'date-month': '99',
        'date-day': '99',
      }

      const result = GovukFrontendDateInput.dateIsValid(obj, 'date')

      expect(result).toEqual(false)
    })

    it('returns false when the year is not 4 digits', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '22',
        'date-month': '12',
        'date-day': '11',
      }

      const result = GovukFrontendDateInput.dateIsValid(obj, 'date')

      expect(result).toEqual(false)
    })

    it('returns false when empty object passed in', () => {
      const result = GovukFrontendDateInput.dateIsValid(undefined, 'date')

      expect(result).toEqual(false)
    })
  })
})
