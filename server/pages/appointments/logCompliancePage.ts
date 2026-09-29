import { AttendanceDataDto } from '../../@types/shared'
import { AppointmentOrSessionParams, AppointmentUpdateQuery, ValidationErrors } from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import ComplianceQuestions, {
  ComplianceQuestionsBody,
  ComplianceQuestionsViewData,
} from '../../utils/components/complianceQuestions'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentPage } from './pathMap'

export interface LogComplianceQuery extends AppointmentUpdateQuery {
  workQuality?: AttendanceDataDto['workQuality']
  behaviour?: AttendanceDataDto['behaviour']
}

export default class LogCompliancePage extends BaseAppointmentUpdatePage<ComplianceQuestionsBody> {
  protected page: AppointmentPage = 'log-compliance'

  getForm(data: AppointmentOutcomeForm, query: LogComplianceQuery = {}): AppointmentOutcomeForm {
    return ComplianceQuestions.updateFormData(data, query)
  }

  viewData(form: AppointmentOutcomeForm, query: ComplianceQuestionsBody = {}): ComplianceQuestionsViewData {
    return ComplianceQuestions.viewData(form, query)
  }

  protected getValidationErrors(body: ComplianceQuestionsBody): ValidationErrors<ComplianceQuestionsBody> {
    return ComplianceQuestions.validate(body)
  }

  protected backPage(_params: AppointmentOrSessionParams): AppointmentPage {
    return 'log-hours'
  }

  protected nextPage(): AppointmentPage {
    return 'confirm-details'
  }
}
