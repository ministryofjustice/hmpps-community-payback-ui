import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import DatePage from '../../pages/appointments/datePage'
import ProjectService from '../../services/projectService'

export default class DateController extends BaseAppointmentController<DatePage> {
  protected async getStepViewData({
    form,
    req,
    res,
    formId,
    offenderSummary,
    appointmentOrSession,
  }: AppointmentStepViewDataParams): Promise<object> {
    const { projectCode } = req.params
    const { projectType } = appointmentOrSession?.session
      ? appointmentOrSession.session
      : await this.projectService.getProject({
          username: res.locals.user.username,
          projectCode: req.params.projectCode,
        })

    const backLink = this.page.getBackPath({
      projectCode,
      date: form.date,
      projectTypeGroup: projectType.group,
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
    private readonly projectService: ProjectService,
  ) {
    super(new DatePage(), appointmentService, appointmentFormService, sessionService, offenderService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/date'
  }
}
