import { ParsedQs } from 'qs'
import { ValidationErrors } from '../@types/user-defined'
import { ContactOutcomeDto } from '../@types/shared'

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

  items(contactOutcomes: ContactOutcomeDto[]): { text: string; value: string }[] {
    return contactOutcomes.map(outcome => ({ text: outcome.name, value: outcome.id }))
  }
}
