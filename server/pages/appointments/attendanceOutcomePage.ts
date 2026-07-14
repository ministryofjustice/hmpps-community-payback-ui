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

type AttendanceOutcomeQuery = {
  attendanceOutcome?: string
} & BodyWithNotes &
  AppointmentUpdateQuery

type ViewData = {
  items: Array<GovUkRadioOrCheckboxOption>
} & ViewDataWithNotes &
  AppointmentUpdatePageViewData

export default class AttendanceOutcomePage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'attendance-outcome'

  private appointmentOrSession: AppointmentOrSession

  private contactOutcomes: ContactOutcomeDto[]

  constructor({
    appointmentOrSession,
    contactOutcomes,
  }: {
    appointmentOrSession: AppointmentOrSession
    contactOutcomes: ContactOutcomeDto[]
  }) {
    super()
    this.appointmentOrSession = appointmentOrSession
    this.contactOutcomes = contactOutcomes
  }

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

  validationErrors(query: AttendanceOutcomeQuery) {
    const validationErrors: ValidationErrors<AttendanceOutcomeBody> = {}

    if (!query.attendanceOutcome) {
      validationErrors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    if (
      this.outcomeIsAttendedOrEnforceable(query.attendanceOutcome) &&
      DateTimeFormats.dateIsInFuture(this.appointmentOrSession.date)
    ) {
      validationErrors.attendanceOutcome = {
        text: 'The outcome entered must be: acceptable absence',
      }
    }

    if (query.notes && query.notes.length > 4000) {
      validationErrors.notes = { text: 'Notes must be 4000 characters or less' }
    }

    return validationErrors
  }

  viewData(
    form: AppointmentOutcomeForm,
    hasErrors: boolean = false,
    formId?: string,
    query?: AttendanceOutcomeQuery,
  ): ViewData {
    const isSingleAppointment = this.isSingleAppointment(this.appointmentOrSession)
    const appointment = isSingleAppointment ? (this.appointmentOrSession as AppointmentDto) : undefined
    return {
      ...this.commonViewData({ appointmentOrSession: this.appointmentOrSession, form, formId }),
      ...NotesUtils.questionItems(query ?? {}, form, appointment, isSingleAppointment),
      items: this.items(form, hasErrors, query),
    }
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    return 'choose-project'
  }

  protected nextPage(form?: AppointmentOutcomeForm): AppointmentFormPage {
    if (!form?.contactOutcome?.attended) {
      return 'confirm-details'
    }

    return 'log-hours'
  }

  private items(
    form: AppointmentOutcomeForm,
    hasErrors: boolean,
    query?: AttendanceOutcomeQuery,
  ): { text: string; value: string }[] {
    const code = hasErrors ? query?.attendanceOutcome : form.contactOutcome?.code
    return this.contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      hint: outcome.hintText ? { text: outcome.hintText } : undefined,
      checked: outcome.code === code,
    }))
  }

  private outcomeIsAttendedOrEnforceable(outcomeCode: string): boolean {
    if (!outcomeCode) return false

    const outcome = this.contactOutcomes.filter(o => o.code === outcomeCode)[0]

    return outcome.attended || outcome.enforceable
  }
}
