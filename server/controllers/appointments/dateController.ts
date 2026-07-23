import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import DatePage from '../../pages/appointments/datePage'

export default class DateController extends BaseAppointmentController<DatePage> {
  protected getStepViewData({ form, req }: AppointmentStepViewDataParams): Promise<object> {
    return Promise.resolve(this.page.viewData(form, req.body))
  }

  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    sessionService: SessionService,
    offenderService: OffenderService,
  ) {
    super(new DatePage(), appointmentService, appointmentFormService, sessionService, offenderService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/date'
  }
}
