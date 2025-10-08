import { ObjectWithDateParts } from '../@types/user-defined'
import InvalidDateStringError from '../errors/invalidDateStringError'
import DateTimeFormats from './dateTimeUtils'

describe('DateTimeFormats', () => {
  describe('isoDateToUIDate', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateTimeFormats.isoDateToUIDate(date)).toEqual('Friday 11 November 2022')
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateTimeFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateTimeFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('convertDateAndTimeInputsToIsoString', () => {
    it('converts a date object', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '12',
        'date-day': '11',
      }

      const result = DateTimeFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-12-11')
    })

    it('pads the months and days', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
      }

      const result = DateTimeFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01')
    })

    it('returns the date with a time if passed one', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
        'date-time': '12:35',
      }

      const result = DateTimeFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01T12:35:00.000Z')
    })

    it('returns an empty string when given empty strings as input', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '',
        'date-month': '',
        'date-day': '',
      }

      const result = DateTimeFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toBeUndefined()
    })

    it('returns an invalid ISO string when given invalid strings as input', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': 'twothousandtwentytwo',
        'date-month': '20',
        'date-day': 'foo',
      }

      const result = DateTimeFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date.toString()).toEqual('twothousandtwentytwo-20-oo')
    })
  })

  describe('dateObjToUiDate', () => {
    it('converts a date to a short format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateTimeFormats.dateObjtoUIDate(date, { format: 'short' })).toEqual('11/11/2022')
    })

    it('converts a date to a medium format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateTimeFormats.dateObjtoUIDate(date, { format: 'medium' })).toEqual('11 November 2022')
    })

    it('converts a date to a long format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateTimeFormats.dateObjtoUIDate(date)).toEqual('Friday 11 November 2022')
    })
  })

  describe('isoToDateObj', () => {
    it('converts a ISO8601 date string', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateTimeFormats.isoToDateObj(date)).toEqual(new Date(2022, 10, 11))
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateTimeFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateTimeFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('stripTime', () => {
    it('strips ":SS" data from a time string', () => {
      const time = '23:12:12'

      expect(DateTimeFormats.stripTime(time)).toEqual('23:12')
    })

    it('returns the same if no seconds data', () => {
      const time = '23:12'

      expect(DateTimeFormats.stripTime(time)).toEqual('23:12')
    })

    const invalidTimes = ['23:12;00', '23:12trr', 'someText', 'some:text', 'tr:12:13', 'tr:12:']

    it.each(invalidTimes)('raises an error if the time is not in the right format', time => {
      expect(() => DateTimeFormats.stripTime(time)).toThrow(new InvalidDateStringError(`Invalid time: ${time}`))
    })
  })

  describe('minutesToHoursAndMinutes', () => {
    const testCases = [
      [90, '1:30'],
      [120, '2:00'],
      [61, '1:01'],
      [640, '10:40'],
    ]

    it.each(testCases)('formats %d to %s', (minutes: number, expected: string) => {
      expect(DateTimeFormats.minutesToHoursAndMinutes(minutes)).toEqual(expected)
    })
  })

  describe('dateAndTimePeriod', () => {
    it.each([
      ['long', 'Friday 3 January 2025, 09:00 - 12:00'],
      ['medium', '3 January 2025, 09:00 - 12:00'],
      ['short', '03/01/2025, 09:00 - 12:00'],
    ])(
      'Returns formatted sentence given correct inputs with %s date format',
      (dateFormat: 'short' | 'medium' | 'long', expected: string) => {
        const date = '2025-01-03'
        const startTime = '09:00'
        const endTime = '12:00'

        expect(DateTimeFormats.dateAndTimePeriod(date, startTime, endTime, { format: dateFormat })).toEqual(expected)
      },
    )

    it.each(['not', '02-02-2023', '02/02/2025'])('Throws an error if isoDate is not a date', (date: string) => {
      const startTime = '09:00'
      const endTime = '12:00'
      expect(() => DateTimeFormats.dateAndTimePeriod(date, startTime, endTime)).toThrow(
        new InvalidDateStringError(`Invalid Date: ${date}`),
      )
    })

    it.each(['not', '02-02-2023', '02/02/2025', '23:12;00', '23:12trr'])(
      'Throws an error if startTime is not a time',
      (startTime: string) => {
        const date = '2025-01-03'
        const endTime = '12:00'
        expect(() => DateTimeFormats.dateAndTimePeriod(date, startTime, endTime)).toThrow(
          new InvalidDateStringError(`Invalid time: ${startTime}`),
        )
      },
    )

    it.each(['not', '02-02-2023', '02/02/2025', '23:12;00', '23:12trr'])(
      'Throws an error if endTimeTime is not a time',
      (endTime: string) => {
        const date = '2025-01-03'
        const startTime = '12:00'
        expect(() => DateTimeFormats.dateAndTimePeriod(date, startTime, endTime)).toThrow(
          new InvalidDateStringError(`Invalid time: ${endTime}`),
        )
      },
    )
  })
})
