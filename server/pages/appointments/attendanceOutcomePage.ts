import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  BodyWithNotes,
  GovUkRadioOrCheckboxOption,
  ValidationErrors,
  ViewDataWithNotes,
} from '../../@types/user-defined'
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
} & ViewDataWithNotes &
  AppointmentUpdatePageViewData

type AttendanceOutcomeContext = {
  appointmentOrSession: AppointmentOrSession
  contactOutcomes: ContactOutcomeDto[]
}

export default class AttendanceOutcomePage extends BaseAppointmentUpdatePage<
  AttendanceOutcomeBody,
  AttendanceOutcomeContext
> {
  protected page: AppointmentFormPage = 'attendance-outcome'

  protected getForm(
    data: AppointmentOutcomeForm,
    outcomes: ContactOutcomeDto[],
    query: AttendanceOutcomeQuery,
  ): AppointmentOutcomeForm {
    const contactOutcome = outcomes.find(outcome => outcome.code === query.attendanceOutcome)

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
      const { appointmentOrSession, contactOutcomes } = additionalParams
      if (
        this.outcomeIsAttendedOrEnforceable(body.attendanceOutcome, contactOutcomes) &&
        DateTimeFormats.dateIsInFuture(appointmentOrSession.date)
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

  viewData(
    form: AppointmentOutcomeForm,
    hasErrors: boolean,
    query: AttendanceOutcomeQuery,
    appointmentOrSession: AppointmentOrSession,
    contactOutcomes: ContactOutcomeDto[],
    formId?: string,
  ): ViewData {
    const isSingleAppointment = this.isSingleAppointment(appointmentOrSession)
    const appointment = isSingleAppointment ? (appointmentOrSession as AppointmentDto) : undefined
    return {
      ...this.commonViewData({ appointmentOrSession, form, formId }),
      ...NotesUtils.questionItems(query, form, appointment, isSingleAppointment),
      items: this.items(form, hasErrors, contactOutcomes, query),
    }
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    return 'choose-project'
  }

  protected nextPage(): AppointmentFormPage {
    if (!this.form?.contactOutcome?.attended) {
      return 'confirm-details'
    }

    return 'log-hours'
  }

  private items(
    form: AppointmentOutcomeForm,
    hasErrors: boolean,
    contactOutcomes: ContactOutcomeDto[],
    query: AttendanceOutcomeQuery,
  ): { text: string; value: string }[] {
    const code = hasErrors ? query.attendanceOutcome : form.contactOutcome?.code
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
