import type { Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage, { AttendanceOutcomeBody } from '../../pages/appointments/attendanceOutcomePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import BaseAppointmentController, {
  AppointmentStepViewDataParams,
  ContextDataParams,
} from './baseAppointmentController'
import { AppointmentOutcomeForm, AppointmentOrSession } from '../../@types/user-defined'
import type { ContactOutcomeDto } from '../../@types/shared'

type AttendanceOutcomeContext = {
  appointmentOrSession: AppointmentOrSession
  contactOutcomes: Array<ContactOutcomeDto>
}

type AttendanceOutcomeContextData = {
  contactOutcomes: Array<ContactOutcomeDto>
  appointmentOrSession: AppointmentOrSession
}

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

  protected async getContextData({
    res,
    appointmentOrSession,
  }: ContextDataParams): Promise<AttendanceOutcomeContextData> {
    const outcomes = await this.referenceDataService.getAvailableContactOutcomes(res.locals.user.username)
    return { contactOutcomes: outcomes.contactOutcomes, appointmentOrSession }
  }

  protected async getStepViewData({
    appointmentOrSession,
    form,
    req,
    contextData,
  }: AppointmentStepViewDataParams): Promise<object> {
    const { contactOutcomes } = contextData as AttendanceOutcomeContextData
    const query = (req.method === 'GET' ? req.query : req.body) as Record<string, unknown>

    return this.page.viewData(appointmentOrSession, form, contactOutcomes, query as AttendanceOutcomeBody)
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
