import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  ValidationErrors,
} from '../../@types/user-defined'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData extends AppointmentUpdatePageViewData {
  startTime: string
  endTime: string
}

interface LogHoursBody {
  startTime: string
  endTime: string
}

export interface LogHoursQuery extends AppointmentUpdateQuery {
  startTime?: string
  endTime?: string
}

export default class LogHoursPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'log-hours'

  hasErrors: boolean

  validationErrors: ValidationErrors<LogHoursBody> = {}

  constructor(private readonly query: LogHoursQuery = {}) {
    super(query)
  }

  getForm(data: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return {
      ...data,
      startTime: this.query.startTime,
      endTime: this.query.endTime,
    }
  }

  validate() {
    if (!this.query.startTime) {
      this.validationErrors.startTime = { text: 'Enter a start time' }
    } else if (!DateTimeFormats.isValidTime(this.query.startTime as string)) {
      this.validationErrors.startTime = { text: 'Enter a valid start time, for example 09:00' }
    }

    if (!this.query.endTime) {
      this.validationErrors.endTime = { text: 'Enter an end time' }
    } else if (!DateTimeFormats.isValidTime(this.query.endTime as string)) {
      this.validationErrors.endTime = { text: 'Enter a valid end time, for example 17:00' }
    }

    if (!this.validationErrors.startTime && !this.validationErrors.endTime) {
      if (!DateTimeFormats.timesAreOrdered(this.query.startTime, this.query.endTime)) {
        this.validationErrors.startTime = { text: `Start time should be before ${this.query.endTime}` }
      }
    }

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }

  viewData(appointmentOrSession: AppointmentOrSession, form: AppointmentOutcomeForm): ViewData {
    const viewData = {
      ...this.commonViewData({ appointmentOrSession, form }),
      startTime: form.startTime ? DateTimeFormats.stripTime(form.startTime) : '',
      endTime: form.endTime ? DateTimeFormats.stripTime(form.endTime) : '',
    }

    if (this.hasErrors) {
      return {
        ...viewData,
        ...this.query,
      }
    }

    return {
      ...viewData,
    }
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    return 'attendance-outcome'
  }

  protected nextPage(): AppointmentFormPage {
    if (this.form.contactOutcome && this.form.contactOutcome.attended) {
      return 'log-compliance'
    }

    return 'confirm-details'
  }
}
