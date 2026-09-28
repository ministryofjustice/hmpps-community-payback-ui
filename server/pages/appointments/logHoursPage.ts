import { AppointmentOrSessionParams, AppointmentUpdateQuery, ValidationErrors } from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import DateTimeFormats from '../../utils/dateTimeUtils'
import StartAndEndTimeQuestion, {
  StartAndEndTimeQuestionBody,
  StartAndEndTimeQuestionViewData,
} from '../../utils/components/startAndEndTimeQuestion'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentPage } from './pathMap'

interface LogHoursQuery extends AppointmentUpdateQuery {
  startTime?: string
  endTime?: string
}

export default class LogHoursPage extends BaseAppointmentUpdatePage<StartAndEndTimeQuestionBody> {
  protected page: AppointmentPage = 'log-hours'

  getForm(data: AppointmentOutcomeForm, query: LogHoursQuery = {}): AppointmentOutcomeForm {
    return {
      ...data,
      startTime: query.startTime ? DateTimeFormats.padTime(query.startTime) : query.startTime,
      endTime: query.endTime ? DateTimeFormats.padTime(query.endTime) : query.endTime,
    }
  }

  protected getValidationErrors(body: StartAndEndTimeQuestionBody = {}): ValidationErrors<StartAndEndTimeQuestionBody> {
    return StartAndEndTimeQuestion.validate(body)
  }

  viewData(form: AppointmentOutcomeForm, query: LogHoursQuery = {}): StartAndEndTimeQuestionViewData {
    return StartAndEndTimeQuestion.viewData(form, query)
  }

  protected backPage(_appointmentOrSession: AppointmentOrSessionParams): AppointmentPage {
    return 'attendance-outcome'
  }

  protected nextPage(): AppointmentPage {
    return 'log-compliance'
  }
}
