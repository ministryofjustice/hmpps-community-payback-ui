import AppointmentService from '../../services/appointmentService'
import AppointmentFormService, { CreateAppointmentForm } from '../../services/forms/appointmentFormService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import DatePage from '../../pages/appointments/datePage'

export default class DateController extends BaseAppointmentController<DatePage> {
  protected async getStepViewData({
    form,
    req,
    formId,
    offenderSummary,
  }: AppointmentStepViewDataParams): Promise<object> {
    const createForm = form as CreateAppointmentForm
    const backLink = this.page.getBackPath({
      projectCode: createForm.originalParams.projectCode,
      date: createForm.originalParams.date,
      projectTypeGroup: createForm.projectTypeGroup,
      formId,
      offenderSummary,
    })

    return {
      ...this.page.viewData(form, req.body),
      backLink,
    }
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
