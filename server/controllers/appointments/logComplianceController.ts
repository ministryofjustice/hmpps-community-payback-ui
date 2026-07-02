import AppointmentService from '../../services/appointmentService'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'

export default class LogComplianceController extends BaseAppointmentController<LogCompliancePage> {
  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    sessionService: SessionService,
  ) {
    super(new LogCompliancePage(), appointmentService, appointmentFormService, sessionService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/logCompliance'
  }

  protected async getStepViewData({
    appointmentOrSession,
    form,
    formId,
    req,
  }: AppointmentStepViewDataParams): Promise<object> {
    const query = (req.method === 'GET' ? req.query : req.body) as Record<string, unknown>
    return this.page.viewData(appointmentOrSession, form, query, formId)
  }
}
