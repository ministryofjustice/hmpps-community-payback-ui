import AppointmentService from '../../services/appointmentService'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import SessionService from '../../services/sessionService'

export default class LogHoursController extends BaseAppointmentController<LogHoursPage> {
  protected getStepViewData({ form, req }: AppointmentStepViewDataParams): Promise<object> {
    return Promise.resolve(this.page.viewData(form, req.body))
  }

  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    sessionService: SessionService,
  ) {
    super(new LogHoursPage(), appointmentService, appointmentFormService, sessionService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/logHours'
  }
}
