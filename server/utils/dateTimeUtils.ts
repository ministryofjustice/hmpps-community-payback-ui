import { format, parseISO, parse, differenceInMinutes, addDays, isAfter, startOfDay } from 'date-fns'

import InvalidDateStringError from '../errors/invalidDateStringError'
import { ObjectWithDateParts, StructuredDate } from '../@types/user-defined'

interface DateFormatOptions {
  format: 'short' | 'medium' | 'long'
}

export default class DateTimeFormats {
  /**
   * @param isoDate an ISO date string.
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static isoDateToUIDate(isoDate: string, options: DateFormatOptions = { format: 'long' }) {
    return DateTimeFormats.dateObjtoUIDate(DateTimeFormats.isoToDateObj(isoDate), options)
  }

  /**
   * @param date JS Date object.
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static dateObjtoUIDate(date: Date, options: DateFormatOptions = { format: 'long' }) {
    if (options.format === 'long') {
      return format(date, 'cccc d MMMM y')
    }
    if (options.format === 'medium') {
      return format(date, 'd MMMM y')
    }
    return format(date, 'dd/LL/y')
  }

  /**
   * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
   * into an ISO8601 date string
   * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
   * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
   * @returns an ISO8601 date string.
   */
  static dateAndTimeInputsToIsoString<K extends string | number>(dateInputObj: ObjectWithDateParts<K>, key: K) {
    const day = `${dateInputObj[`${key}-day`]}`
    const month = `${dateInputObj[`${key}-month`]}`
    const year = dateInputObj[`${key}-year`]
    const time = dateInputObj[`${key}-time`]

    const o: { [P in K]?: string } = dateInputObj
    if (day && month && year) {
      if (time) {
        o[key] = `${year}-${month}-${day}T${time}:00.000Z`
      } else {
        o[key] = `${year}-${month}-${day}`
      }
    } else {
      o[key] = undefined
    }

    return dateInputObj
  }

  /**
   * Converts an ISO8601 datetime string into a Javascript Date object.
   * @param date An ISO8601 datetime string
   * @returns A Date object
   * @throws {InvalidDateStringError} If the string is not a valid ISO8601 datetime string
   */
  static isoToDateObj(date: string) {
    const parsedDate = parseISO(date)

    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvalidDateStringError(`Invalid Date: ${date}`)
    }

    return parsedDate
  }

  /**
   * Formats a time string into HH:MM format, removing any trailing :SS.
   * @param string a time string
   * @returns A string
   */
  static stripTime(time: string) {
    if (!DateTimeFormats.isValidTime(time)) {
      throw new InvalidDateStringError(`Invalid time: ${time}`)
    }

    const timeParts = time.split(':')

    return `${timeParts[0]}:${timeParts[1]}`
  }

  /**
   * Formats a time string into HH:MM:SS format, adding trailing :SS.
   * @param string a time string
   * @returns A string
   */
  static addSecondsToTime(time: string) {
    if (!DateTimeFormats.isValidTime(time)) {
      throw new InvalidDateStringError(`Invalid time: ${time}`)
    }

    if (time.split(':').length === 3) {
      return time
    }

    return `${time}:00`
  }

  /**
   * Converts a number representing minutes to h:MM
   * @param number representing minutes
   * @returns A string
   */
  static minutesToHoursAndMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const minutesRemaining = minutes % 60

    return `${hours}:${DateTimeFormats.padTimePart(minutesRemaining)}`
  }

  /**
   * Converts two strings representing hours and minutes to a number representing total minutes
   * @param hours a number representing hours
   * @param minutes a number representing minutes
   * @returns A number
   */
  static hoursAndMinutesToMinutes(hours: string, minutes: string): number {
    if (!hours && !minutes) {
      return null
    }

    const hoursAsMinutes = parseInt(hours as string, 10) * 60
    const minutesAsNumber = parseInt(minutes as string, 10)
    const totalMinutes = hoursAsMinutes + minutesAsNumber

    return totalMinutes
  }

  /**
   * Returns a sentence containing a date and time period
   * @param isoDate - a date string in iso format
   * @param startTime - a time string in HH:MM or HH:MM:SS format
   * @param endTime - a time string in HH:MM or HH:MM:SS format
   * @returns A string
   */
  static dateAndTimePeriod(
    isoDate: string,
    startTime: string,
    endTime: string,
    dateFormatOptions: DateFormatOptions = { format: 'long' },
  ) {
    const formattedDate = DateTimeFormats.isoDateToUIDate(isoDate, dateFormatOptions)
    const formattedStartTime = DateTimeFormats.stripTime(startTime)
    const formattedEndTime = DateTimeFormats.stripTime(endTime)

    return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`
  }

  /**
   * Returns a sentence containing a date and time period
   * @param startTime - a time string in HH:MM or HH:MM:SS format
   * @param endTime - a time string in HH:MM or HH:MM:SS format
   * @returns format:long - A string in the format: '2 hours'
   * @returns format:short - A string in the format: '02:00'
   */
  static timeBetween(startTime: string, endTime: string, options: { format: 'long' | 'short' } = { format: 'long' }) {
    if (!DateTimeFormats.isValidTime(startTime)) {
      throw new InvalidDateStringError(`Invalid Date: ${startTime}`)
    } else if (!DateTimeFormats.isValidTime(endTime)) {
      throw new InvalidDateStringError(`Invalid Date: ${endTime}`)
    }

    const startDate = parse(DateTimeFormats.stripTime(startTime), 'HH:mm', new Date())
    const endDate = parse(DateTimeFormats.stripTime(endTime), 'HH:mm', new Date())

    if (endDate < startDate) {
      throw new Error(`End time cannot be before start time${startDate}`)
    }

    const diffInMinutes = differenceInMinutes(endDate, startDate)
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60

    if (options.format === 'long') {
      return DateTimeFormats.hoursAndMinutesToHumanReadable(hours, minutes)
    }

    return `${DateTimeFormats.padTimePart(hours)}:${DateTimeFormats.padTimePart(minutes)}`
  }

  /**
   * Returns a sentence containing a date and time period
   * @param hours - number
   * @param minutes - number
   * @returns A string in the format: '2 hours 10 minutes'
   */
  static hoursAndMinutesToHumanReadable(hours: number, minutes: number) {
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  /**
   * Check that a string is in the HH:MM or HH:MM:SS format (12 or 24 hour clock).
   * @param string a time string
   * @returns A boolean
   */
  static isValidTime(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]($|:[0-5][0-9]$)/.test(time)
  }

  /**
   * @param monthsToAdd the number of months to add to todays date
   * @returns {StructuredDate} an object that contains the computed date in parts e.g `year: 2024` and in whole e.g `2024-05-12`
   */
  static getTodaysDatePlusDays = (daysToAdd = 0): StructuredDate => {
    const date = new Date()
    const result = addDays(date, daysToAdd)

    const year = result.getFullYear().toString()
    const month = (result.getMonth() + 1).toString().padStart(2, '0')
    const day = result.getDate().toString().padStart(2, '0')

    return {
      year,
      month,
      day,
      formattedDate: `${year}-${month}-${day}`,
    }
  }

  /**
   * Checks that the first time passed is earlier than the second time
   * @param firstTime - string like 05:00
   * @param secondTime - string like 05:00
   * @returns A boolean
   */
  static timesAreOrdered(firstTime: string, secondTime: string): boolean {
    const firstDate = new Date(`1970-01-01T${firstTime}:00`)
    const secondDate = new Date(`1970-01-01T${secondTime}:00`)

    return +firstDate < +secondDate
  }

  /**
   * Checks that the first time passed is earlier than the second time
   * @param date - string like "2024-10-25"
   * @returns A boolean
   */
  static dateIsInFuture(date: string): boolean {
    return isAfter(startOfDay(date), startOfDay(new Date()))
  }

  /**
   * Convert a number to string and add a 0 at the start if a single digit.
   * @param number
   * @returns A string
   */
  private static padTimePart(time: number): string {
    return time.toString().padStart(2, '0')
  }
}
