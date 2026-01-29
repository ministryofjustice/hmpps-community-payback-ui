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

    it('returns the date with a time if passed one', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '01',
        'date-day': '01',
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
        'date-month': '2',
        'date-day': 'foo',
      }

      const result = DateTimeFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date.toString()).toEqual('twothousandtwentytwo-2-foo')
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

  describe('totalMinutesToHoursAndMinutesParts', () => {
    it.each([
      [0, { hours: '0', minutes: '00' }],
      [60, { hours: '1', minutes: '00' }],
      [61, { hours: '1', minutes: '01' }],
      [90, { hours: '1', minutes: '30' }],
      [640, { hours: '10', minutes: '40' }],
    ])('formats %d to %o', (totalMinutes: number, expected: { hours: string; minutes: string }) => {
      expect(DateTimeFormats.totalMinutesToHoursAndMinutesParts(totalMinutes)).toEqual(expected)
    })

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
      'throws for invalid totalMinutes %s',
      (totalMinutes: number) => {
        expect(() => DateTimeFormats.totalMinutesToHoursAndMinutesParts(totalMinutes)).toThrow(RangeError)
      },
    )
  })

  describe('hoursAndMinutesToMinutes', () => {
    const testCases = [
      { hours: '1', minutes: '30', expected: 90 },
      { hours: '2', minutes: '0', expected: 120 },
      { hours: '1', minutes: '1', expected: 61 },
      { hours: '10', minutes: '40', expected: 640 },
    ]

    it.each(testCases)(
      'converts $hours hours and $minutes minutes to $expected total minutes',
      ({ hours, minutes, expected }) => {
        expect(DateTimeFormats.hoursAndMinutesToMinutes(hours, minutes)).toEqual(expected)
      },
    )
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

  describe('isValidTime', () => {
    it.each([
      ['234:00', false],
      ['34456', false],
      ['1:', false],
      ['1', false],
      [':4', false],
      [23, false],
      [null, false],
      ['', false],
      ['-', false],
      ['01:0l', false],
      ['17:00', true],
      ['17:00:45', true],
    ])('returns false if not valid 24 hour time', (time: string, expected: boolean) => {
      expect(DateTimeFormats.isValidTime(time)).toEqual(expected)
    })
  })

  describe('addSecondsToTime', () => {
    it.each([
      ['17:00', '17:00:00'],
      ['17:00:45', '17:00:45'],
    ])('adds seconds to time in HH:MM format', (time: string, expected: string) => {
      expect(DateTimeFormats.addSecondsToTime(time)).toEqual(expected)
    })

    it.each([['17:00:60'], ['not'], ['09'], ['09:0']])('throws an error if time is not valid', (time: string) => {
      expect(() => DateTimeFormats.addSecondsToTime(time)).toThrow(new InvalidDateStringError(`Invalid time: ${time}`))
    })
  })

  describe('timeBetween', () => {
    describe('when format is "long"', () => {
      it.each([
        ['09:00', '17:00', '8 hours'],
        ['09:23', '17:05', '7 hours 42 minutes'],
        ['10:00', '10:45', '45 minutes'],
        ['14:15', '16:30', '2 hours 15 minutes'],
        ['08:00', '08:00', '0 minutes'],
        ['00:00', '12:00', '12 hours'],
        ['09:30:00', '10:30:00', '1 hour'],
        ['07:45:01', '08:15:02', '30 minutes'],
      ])(
        'should return a string representing the time between the given start and end times',
        (startTime: string, endTime: string, expected: string) => {
          expect(DateTimeFormats.timeBetween(startTime, endTime)).toBe(expected)
        },
      )
    })

    describe('when format is "short"', () => {
      it.each([
        ['09:00', '17:00', '08:00'],
        ['09:23', '17:05', '07:42'],
        ['10:00', '10:45', '00:45'],
        ['14:15', '16:30', '02:15'],
        ['08:00', '08:00', '00:00'],
        ['00:00', '12:00', '12:00'],
        ['09:30:00', '10:30:00', '01:00'],
        ['07:45:01', '08:15:02', '00:30'],
      ])(
        'should return a string representing the time between the given start and end times',
        (startTime: string, endTime: string, expected: string) => {
          expect(DateTimeFormats.timeBetween(startTime, endTime, { format: 'short' })).toBe(expected)
        },
      )
    })

    it.each([
      ['23:59', '00:01'],
      ['22:30', '06:15'],
      ['12:00', '00:00'],
    ])('should throw an error if endTime is before startTime', (startTime: string, endTime: string) => {
      expect(() => DateTimeFormats.timeBetween(startTime, endTime)).toThrow()
    })

    it.each([
      ['09:00', '171:00'],
      [null, '17:00'],
      ['', ''],
    ])('should throw if either startTime or endTime is not a valid time', (startTime: string, endTime: string) => {
      expect(() => DateTimeFormats.timeBetween(startTime, endTime)).toThrow()
    })
  })

  describe('hoursAndMinutesToHumanReadable', () => {
    it.each([
      [8, 0, '8 hours'],
      [7, 42, '7 hours 42 minutes'],
      [1, 15, '1 hour 15 minutes'],
    ])(
      'should return a natural language string for the given time',
      (hours: number, minutes: number, expected: string) => {
        expect(DateTimeFormats.hoursAndMinutesToHumanReadable(hours, minutes)).toBe(expected)
      },
    )
  })

  describe('getTodaysDatePlusMonthsAndDays', () => {
    it('returns a string of todays date', () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-02-01'))

      const result = DateTimeFormats.getTodaysDatePlusDays(4)

      expect(result.year).toBe('2025')
      expect(result.month).toBe('02')
      expect(result.day).toBe('05')
      expect(result.formattedDate).toBe('2025-02-05')
    })
  })

  describe('timesAreOrdered', () => {
    it('returns true if first time is before second time', () => {
      const firstTime = '05:00'
      const secondTime = '07:00'

      expect(DateTimeFormats.timesAreOrdered(firstTime, secondTime)).toBe(true)
    })

    it('returns false if first time is after second time', () => {
      const firstTime = '07:00'
      const secondTime = '05:00'

      expect(DateTimeFormats.timesAreOrdered(firstTime, secondTime)).toBe(false)
    })

    it('returns false if first date and second date are equal', () => {
      const firstTime = '07:00'
      const secondTime = '07:00'

      expect(DateTimeFormats.timesAreOrdered(firstTime, secondTime)).toBe(false)
    })
  })

  describe('dateIsInFuture', () => {
    it('returns true if date is in the future', () => {
      const date = DateTimeFormats.getTodaysDatePlusDays(1).formattedDate

      expect(DateTimeFormats.dateIsInFuture(date)).toBe(true)
    })

    it('returns false if date is today', () => {
      const date = DateTimeFormats.getTodaysDatePlusDays(0).formattedDate

      expect(DateTimeFormats.dateIsInFuture(date)).toBe(false)
    })

    it('returns false if date is in the past', () => {
      const date = '2020-10-23'

      expect(DateTimeFormats.dateIsInFuture(date)).toBe(false)
    })
  })

  describe('datesAreWithinNDays', () => {
    it('returns false if dates are more than N days apart', () => {
      const firstDate = '2026-01-10'
      const secondDate = '2026-01-18'

      expect(DateTimeFormats.datesAreWithinNDays(firstDate, secondDate, 3)).toBe(false)
    })

    it('returns true if dates are exactly N days apart', () => {
      const firstDate = '2026-01-10'
      const secondDate = '2026-01-13'

      expect(DateTimeFormats.datesAreWithinNDays(firstDate, secondDate, 3)).toBe(true)
    })

    it('returns true if dates are less than N days apart', () => {
      const firstDate = '2026-01-10'
      const secondDate = '2026-01-12'

      expect(DateTimeFormats.datesAreWithinNDays(firstDate, secondDate, 3)).toBe(true)
    })
  })
})
