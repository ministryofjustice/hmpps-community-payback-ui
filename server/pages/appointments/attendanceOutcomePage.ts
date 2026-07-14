import {
  AppointmentUpdateQuery,
  BodyWithNotes,
  GovUkRadioOrCheckboxOption,
  ValidationErrors,
  ViewDataWithNotes,
} from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import { AppointmentDto, ContactOutcomeDto } from '../../@types/shared'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import DateTimeFormats from '../../utils/dateTimeUtils'
import NotesUtils from '../../utils/components/notesUtils'
import { AppointmentFormPage } from './pathMap'

export type AttendanceOutcomeBody = {
  attendanceOutcome: string
  notes?: string
}

export type AttendanceOutcomeQuery = {
  attendanceOutcome?: string
} & BodyWithNotes &
  AppointmentUpdateQuery

type ViewData = {
  items: Array<GovUkRadioOrCheckboxOption>
} & ViewDataWithNotes

type AttendanceOutcomeContext = {
  form: AppointmentOutcomeForm
  contactOutcomes: ContactOutcomeDto[]
}

export default class AttendanceOutcomePage extends BaseAppointmentUpdatePage<
  AttendanceOutcomeQuery,
  AttendanceOutcomeContext
> {
  protected page: AppointmentFormPage = 'attendance-outcome'

  protected getForm(
    data: AppointmentOutcomeForm,
    query: AttendanceOutcomeQuery,
    { contactOutcomes }: AttendanceOutcomeContext,
  ): AppointmentOutcomeForm {
    const contactOutcome = contactOutcomes.find(outcome => outcome.code === query.attendanceOutcome)

    return {
      ...data,
      ...NotesUtils.formData(query),
      contactOutcome,
    }
  }

  protected getValidationErrors(
    body: AttendanceOutcomeBody,
    additionalParams?: AttendanceOutcomeContext,
  ): ValidationErrors<AttendanceOutcomeBody> {
    const validationErrors: ValidationErrors<AttendanceOutcomeBody> = {}

    if (!body.attendanceOutcome) {
      validationErrors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    if (additionalParams) {
      const { form, contactOutcomes } = additionalParams
      if (
        this.outcomeIsAttendedOrEnforceable(body.attendanceOutcome, contactOutcomes) &&
        DateTimeFormats.dateIsInFuture(form.date)
      ) {
        validationErrors.attendanceOutcome = {
          text: 'The outcome entered must be: acceptable absence',
        }
      }
    }

    if (body.notes && body.notes.length > 4000) {
      validationErrors.notes = { text: 'Notes must be 4000 characters or less' }
    }

    return validationErrors
  }

  viewData({
    form,
    query,
    contactOutcomes,
    appointment,
    isSingleAppointment,
  }: {
    form: AppointmentOutcomeForm
    query: AttendanceOutcomeQuery
    contactOutcomes: ContactOutcomeDto[]
    appointment?: AppointmentDto
    isSingleAppointment: boolean
  }): ViewData {
    return {
      ...NotesUtils.questionItems(query, form, appointment, isSingleAppointment),
      items: this.items(form, contactOutcomes, query),
    }
  }

  protected backPage(_isSingleAppointment: boolean): AppointmentFormPage {
    return 'choose-project'
  }

  protected nextPage(form: AppointmentOutcomeForm): AppointmentFormPage {
    if (!form?.contactOutcome?.attended) {
      return 'confirm-details'
    }

    return 'log-hours'
  }

  private items(
    form: AppointmentOutcomeForm,
    contactOutcomes: ContactOutcomeDto[],
    query: AttendanceOutcomeQuery,
  ): { text: string; value: string }[] {
    const code = query.attendanceOutcome ?? form.contactOutcome?.code
    return contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      hint: outcome.hintText ? { text: outcome.hintText } : undefined,
      checked: outcome.code === code,
    }))
  }

  private outcomeIsAttendedOrEnforceable(outcomeCode: string, contactOutcomes: ContactOutcomeDto[]): boolean {
    if (!outcomeCode) return false

    const outcome = contactOutcomes.filter(o => o.code === outcomeCode)[0]

    return outcome.attended || outcome.enforceable
  }
}
