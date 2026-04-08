import { ValidationErrors } from '../@types/user-defined'
import { isWholePositiveNumber } from '../utils/utils'

export type ObjectWithHoursAndMinutes = {
  hours?: string
  minutes?: string
}

export default class HoursAndMinutesInput {
  static validationErrors(body: ObjectWithHoursAndMinutes, questionDescription: string) {
    const validationErrors = {} as ValidationErrors<ObjectWithHoursAndMinutes>

    if (!body.hours && !body.minutes) {
      validationErrors.hours = { text: `Enter hours and minutes for ${questionDescription}` }
      return validationErrors
    }

    if (body.hours) {
      if (!isWholePositiveNumber(body.hours)) {
        validationErrors.hours = { text: `Enter valid hours for ${questionDescription}, for example 2` }
      }
    }

    if (body.minutes) {
      if (!isWholePositiveNumber(body.minutes) || Number(body.minutes) > 59) {
        validationErrors.minutes = { text: `Enter valid minutes for ${questionDescription}, for example 30` }
      }
    }

    return validationErrors
  }
}
