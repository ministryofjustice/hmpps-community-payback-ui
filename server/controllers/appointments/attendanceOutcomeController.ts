import type { Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage, {
  AttendanceOutcomeBody,
  AttendanceOutcomeContext,
} from '../../pages/appointments/attendanceOutcomePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import BaseAppointmentController, {
  AppointmentStepViewDataParams,
  ContextDataParams,
} from './baseAppointmentController'
import { AppointmentOutcomeForm } from '../../@types/user-defined'

export default class AttendanceOutcomeController extends BaseAppointmentController<AttendanceOutcomePage> {
  constructor(
    appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
    appointmentFormService: AppointmentFormService,
    sessionService: SessionService,
  ) {
    super(new AttendanceOutcomePage(), appointmentService, appointmentFormService, sessionService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/attendanceOutcome'
  }

  protected async getContextData({ res, form }: ContextDataParams): Promise<AttendanceOutcomeContext> {
    const outcomes = await this.referenceDataService.getAvailableContactOutcomes(res.locals.user.username)
    return { contactOutcomes: outcomes.contactOutcomes, form }
  }

  protected async getStepViewData({
    appointmentOrSession,
    form,
    formId,
    req,
    contextData,
  }: AppointmentStepViewDataParams): Promise<object> {
    const { contactOutcomes } = contextData as AttendanceOutcomeContext
    const query = (req.method === 'GET' ? req.query : req.body) as Record<string, unknown>

    return this.page.viewData(appointmentOrSession, form, contactOutcomes, formId, query as AttendanceOutcomeBody)
  }

  protected async getUpdatedForm(
    req: Request,
    _res: Response,
    form: AppointmentOutcomeForm,
    contextData?: AttendanceOutcomeContext,
  ): Promise<AppointmentOutcomeForm> {
    const query = (req.method === 'GET' ? req.query : req.body) as AttendanceOutcomeBody

    return this.page.updateForm(form, query, contextData)
  }
}
