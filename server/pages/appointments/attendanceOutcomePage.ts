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
import NotesUtils from '../../utils/notesUtils'
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

  private query: AttendanceOutcomeQuery

  private appointmentOrSession: AppointmentOrSession

  private contactOutcomes: ContactOutcomeDto[]

  constructor({
    query,
    appointmentOrSession,
    contactOutcomes,
  }: {
    query: AttendanceOutcomeQuery
    appointmentOrSession: AppointmentOrSession
    contactOutcomes: ContactOutcomeDto[]
  }) {
    super(query)
    this.query = query
    this.appointmentOrSession = appointmentOrSession
    this.contactOutcomes = contactOutcomes
  }

  protected getForm(data: AppointmentOutcomeForm, outcomes: ContactOutcomeDto[]): AppointmentOutcomeForm {
    const contactOutcome = outcomes.find(outcome => outcome.code === this.query.attendanceOutcome)

    return {
      ...data,
      ...NotesUtils.formData(this.query),
      contactOutcome,
    }
  }

  validationErrors() {
    const validationErrors: ValidationErrors<AttendanceOutcomeBody> = {}

    if (!this.query.attendanceOutcome) {
      validationErrors.attendanceOutcome = { text: 'Select an attendance outcome' }
    }

    if (
      this.outcomeIsAttendedOrEnforceable(this.query.attendanceOutcome) &&
      DateTimeFormats.dateIsInFuture(this.appointmentOrSession.date)
    ) {
      validationErrors.attendanceOutcome = {
        text: 'The outcome entered must be: acceptable absence',
      }
    }

    if (this.query.notes && this.query.notes.length > 4000) {
      validationErrors.notes = { text: 'Notes must be 4000 characters or less' }
    }

    return validationErrors
  }

  viewData(form: AppointmentOutcomeForm, hasErrors: boolean = false): ViewData {
    const isSingleAppointment = this.isSingleAppointment(this.appointmentOrSession)
    const appointment = isSingleAppointment ? (this.appointmentOrSession as AppointmentDto) : undefined
    return {
      ...this.commonViewData({ appointmentOrSession: this.appointmentOrSession }),
      ...NotesUtils.questionItems(this.query, form, appointment, isSingleAppointment),
      items: this.items(form, hasErrors),
    }
  }

  protected backPage(): AppointmentFormPage {
    return 'choose-supervisor'
  }

  protected nextPage(): AppointmentFormPage {
    const contactOutcome = this.contactOutcomes.find(outcome => outcome.code === this.query.attendanceOutcome)

    if (!contactOutcome?.attended) {
      return 'confirm-details'
    }

    return 'log-hours'
  }

  private items(form: AppointmentOutcomeForm, hasErrors: boolean): { text: string; value: string }[] {
    const code = hasErrors ? this.query.attendanceOutcome : form.contactOutcome?.code
    return this.contactOutcomes.map(outcome => ({
      text: outcome.name,
      value: outcome.code,
      checked: outcome.code === code,
    }))
  }

  private outcomeIsAttendedOrEnforceable(outcomeCode: string): boolean {
    if (!outcomeCode) return false

    const outcome = this.contactOutcomes.filter(o => o.code === outcomeCode)[0]

    return outcome.attended || outcome.enforceable
  }
}
