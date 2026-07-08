import type { Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage, {
  AttendanceOutcomeBody,
  AttendanceOutcomeQuery,
} from '../../pages/appointments/attendanceOutcomePage'
import AppointmentFormService, { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import BaseAppointmentController, {
  AppointmentStepViewDataParams,
  ContextDataParams,
} from './baseAppointmentController'
import { AppointmentOrSession } from '../../@types/user-defined'
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
    offenderService: OffenderService,
  ) {
    super(new AttendanceOutcomePage(), appointmentService, appointmentFormService, sessionService, offenderService)
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

    return this.page.viewData(form, false, query as AttendanceOutcomeQuery, appointmentOrSession, contactOutcomes)
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
