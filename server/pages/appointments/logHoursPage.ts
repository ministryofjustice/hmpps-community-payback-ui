import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdateQuery,
  ValidationErrors,
} from '../../@types/user-defined'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData {
  startTime: string
  endTime: string
}

interface LogHoursBody {
  startTime?: string
  endTime?: string
}

interface LogHoursQuery extends AppointmentUpdateQuery {
  startTime?: string
  endTime?: string
}

export default class LogHoursPage extends BaseAppointmentUpdatePage<LogHoursBody> {
  protected page: AppointmentFormPage = 'log-hours'

  getForm(data: AppointmentOutcomeForm, query: LogHoursQuery = {}): AppointmentOutcomeForm {
    return {
      ...data,
      startTime: query.startTime,
      endTime: query.endTime,
    }
  }

  protected getValidationErrors(body: LogHoursBody = {}): ValidationErrors<LogHoursBody> {
    const errors: ValidationErrors<LogHoursBody> = {}

    if (!body.startTime) {
      errors.startTime = { text: 'Enter a start time' }
    } else if (!DateTimeFormats.isValidTime(body.startTime as string)) {
      errors.startTime = { text: 'Enter a valid start time, for example 09:00' }
    }

    if (!body.endTime) {
      errors.endTime = { text: 'Enter an end time' }
    } else if (!DateTimeFormats.isValidTime(body.endTime)) {
      errors.endTime = { text: 'Enter a valid end time, for example 17:00' }
    }

    if (!errors.startTime && !errors.endTime) {
      if (!DateTimeFormats.timesAreOrdered(body.startTime, body.endTime)) {
        errors.startTime = { text: `Start time should be before ${body.endTime}` }
      }
    }

    return errors
  }

  viewData(form: AppointmentOutcomeForm, query: LogHoursQuery = {}): ViewData {
    return {
      startTime: query.startTime ?? (form.startTime ? DateTimeFormats.stripTime(form.startTime) : ''),
      endTime: query.endTime ?? (form.endTime ? DateTimeFormats.stripTime(form.endTime) : ''),
    }
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    return 'attendance-outcome'
  }

  protected nextPage(): AppointmentFormPage {
    return 'log-compliance'
  }
}
