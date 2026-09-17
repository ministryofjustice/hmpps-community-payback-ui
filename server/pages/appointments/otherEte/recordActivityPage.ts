import { ContactOutcomeDto, UnpaidWorkDetailsDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import MojDateInput from '../../../forms/mojDateInput'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import NotesUtils from '../../../utils/components/notesUtils'
import StartAndEndTimeQuestion, { StartAndEndTimeQuestionBody } from '../../../utils/components/startAndEndTimeQuestion'
import UnpaidWorkUtils from '../../../utils/unpaidWorkUtils'

export type RecordActivityBody = {
  date?: string
  attendanceOutcome?: string
  notes?: string
  isSensitive?: 'yes'
} & StartAndEndTimeQuestionBody

export type RecordActivityContext = {
  contactOutcomes: ContactOutcomeDto[]
  unpaidWorkDetails: UnpaidWorkDetailsDto[]
}

export default class RecordActivityPage {
  static validate(query: RecordActivityBody): ValidationErrors<RecordActivityBody> {
    const errors: ValidationErrors<RecordActivityBody> = {}

    const dateError = MojDateInput.validate(query.date)
    if (dateError) {
      errors.date = dateError
    } else if (DateTimeFormats.dateIsInFuture(MojDateInput.toIsoDate(query.date))) {
      errors.date = { text: 'Date must not be in the future' }
    }

    if (!query.attendanceOutcome) {
      errors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    const notesError = NotesUtils.validate(query.notes)
    if (notesError) {
      errors.notes = notesError
    }

    Object.assign(errors, StartAndEndTimeQuestion.validate(query))

    return errors
  }

  static viewData(
    form: RecordActivityForm,
    contextData: RecordActivityContext,
    query: RecordActivityBody = {},
  ): object {
    return {
      date: RecordActivityPage.dateViewValue(query, form),
      items: RecordActivityPage.outcomeItems(
        contextData.contactOutcomes,
        query.attendanceOutcome ?? form.contactOutcome?.code,
      ),
      ...StartAndEndTimeQuestion.viewData(form, query),
      requirementDetailsItems: RecordActivityPage.requirementDetailsItems(
        contextData.unpaidWorkDetails,
        form.deliusEventNumber,
      ),
      ...NotesUtils.questionItems(query, form, undefined, true),
    }
  }

  static updateFormData(
    form: RecordActivityForm,
    body: RecordActivityBody,
    contextData: RecordActivityContext,
  ): RecordActivityForm {
    const contactOutcome = contextData.contactOutcomes.find(outcome => outcome.code === body.attendanceOutcome)

    return {
      ...form,
      ...NotesUtils.formData(body),
      date: MojDateInput.toIsoDate(body.date),
      startTime: DateTimeFormats.padTime(body.startTime),
      endTime: DateTimeFormats.padTime(body.endTime),
      contactOutcome,
    }
  }

  private static outcomeItems(contactOutcomes: ContactOutcomeDto[], selectedCode?: string) {
    return contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      checked: outcome.code === selectedCode,
    }))
  }

  private static dateViewValue(query: RecordActivityBody, form: RecordActivityForm): string {
    if (query.date !== undefined) {
      return query.date
    }

    return form.date ? DateTimeFormats.isoDateToUIDate(form.date, { format: 'short' }) : ''
  }

  private static requirementDetailsItems(unpaidWorkDetails: UnpaidWorkDetailsDto[], deliusEventNumber: string) {
    const requirement = unpaidWorkDetails.find(detail => detail.eventNumber === Number(deliusEventNumber))

    return requirement ? UnpaidWorkUtils.unpaidWorkHoursDetails(requirement, true) : undefined
  }
}
