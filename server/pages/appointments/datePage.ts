import { AppointmentOrSessionParams, ValidationErrors } from '../../@types/user-defined'
import MojDateInput from '../../forms/mojDateInput'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData {
  date: string
}

interface DateBody {
  date?: string
  endTime?: string
}

export default class DatePage extends BaseAppointmentUpdatePage<DateBody> {
  protected page: AppointmentFormPage = 'date'

  constructor() {
    super()
  }

  getForm(data: AppointmentOutcomeForm, body: DateBody = {}): AppointmentOutcomeForm {
    return {
      ...data,
      date: MojDateInput.toIsoDate(body.date),
    }
  }

  protected getValidationErrors(body: DateBody): ValidationErrors<DateBody> {
    const errors: ValidationErrors<DateBody> = {}

    const dateError = MojDateInput.validate(body.date)

    if (dateError) {
      errors.date = dateError
    }

    return errors
  }

  viewData(form: AppointmentOutcomeForm, body: DateBody = {}): ViewData {
    return {
      date: body.date ?? DateTimeFormats.isoDateToUIDate(form.date, { format: 'short' }),
    }
  }

  protected backPage(_pathData: AppointmentOrSessionParams): AppointmentFormPage {
    return undefined
  }

  protected nextPage(): AppointmentFormPage {
    return 'choose-supervisor'
  }
}
