import DateTimeFormats from '../utils/dateTimeUtils'
import { ObjectWithDateParts, StructuredDate } from '../@types/user-defined'
import InvalidDateStringError from '../errors/invalidDateStringError'

export interface GovUkFrontendDateInputItem {
  name: string
  classes: string
  value: string
}

export default class GovukFrontendDateInput {
  static getDateItems<K extends string>(
    dateInputObj: ObjectWithDateParts<K>,
    key: K,
    hasError: boolean = false,
  ): GovUkFrontendDateInputItem[] {
    const date: StructuredDate = {
      day: dateInputObj[`${key}-day`] ? (dateInputObj[`${key}-day`] as string) : '',
      month: dateInputObj[`${key}-day`] ? (dateInputObj[`${key}-month`] as string) : '',
      year: dateInputObj[`${key}-day`] ? (dateInputObj[`${key}-year`] as string) : '',
      formattedDate: '',
    }

    return this.getDateItemsFromStructuredDate(date, hasError)
  }

  static getDateItemsFromStructuredDate(date: StructuredDate, hasError: boolean = false): GovUkFrontendDateInputItem[] {
    const { day, month, year } = date
    const errorClass = hasError ? ' govuk-input--error' : ''

    return [
      {
        name: 'day',
        classes: `govuk-input--width-2${errorClass}`,
        value: day,
      },
      {
        name: 'month',
        classes: `govuk-input--width-2${errorClass}`,
        value: month,
      },
      {
        name: 'year',
        classes: `govuk-input--width-4${errorClass}`,
        value: year,
      },
    ]
  }

  static dateIsComplete<K extends string>(dateInputObj: ObjectWithDateParts<K>, key: K) {
    const dateParts = ['year', 'month', 'day'] as const

    return dateParts.every(part => {
      return Boolean(dateInputObj[`${key}-${part}`])
    })
  }

  static dateIsValid<K extends string>(dateInputObj: ObjectWithDateParts<K>, key: K) {
    if (!dateInputObj) {
      return false
    }

    const inputYear = dateInputObj[`${key}-year`] as string

    if (inputYear && inputYear.length !== 4) return false

    const dateString = DateTimeFormats.dateAndTimeInputsToIsoString(dateInputObj, key)

    try {
      DateTimeFormats.isoToDateObj(dateString[key])
    } catch (err) {
      if (err instanceof InvalidDateStringError || err instanceof TypeError) {
        return false
      }
    }

    return true
  }
}
