import { ParsedQs } from 'qs'
import { ValidationErrors } from '../@types/user-defined'

export type AttendanceOutcomeBody = {
  attendanceOutcome: string
}

export default class AttendanceOutcomePage {
  private query: ParsedQs

  constructor(query: ParsedQs) {
    this.query = query
  }

  validationErrors() {
    const validationErrors: ValidationErrors<AttendanceOutcomeBody> = {}

    if (!this.query.attendanceOutcome) {
      validationErrors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    return validationErrors
  }
}
