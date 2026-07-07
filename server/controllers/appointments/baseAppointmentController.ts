import type { Request, RequestHandler, Response } from 'express'
import BaseAppointmentUpdatePage from '../../pages/appointments/baseAppointmentUpdatePage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import {
  AppointmentParams,
  AppointmentOrSessionParams,
  AppointmentOrSession,
  AppointmentOutcomeForm,
  ValidationErrors,
  IAppointmentFormPageController,
} from '../../@types/user-defined'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import { ErrorViewData } from '../../utils/errorUtils'

export type AppointmentStepViewDataParams = {
  req: Request
  res: Response
  appointmentOrSession: AppointmentOrSession
  form: AppointmentOutcomeForm
  formId?: string
  errors: ValidationErrors<unknown>
  contextData?: unknown
}

export type ContextDataParams = {
  req: Request
  res: Response
  appointmentOrSession: AppointmentOrSession
  form: AppointmentOutcomeForm
}

type ShowPageOptions = {
  errorViewData?: Pick<ErrorViewData<unknown>, 'errors' | 'errorSummary'>
  form?: AppointmentOutcomeForm
  formId?: string
}

export default abstract class BaseAppointmentController<
  TPage extends BaseAppointmentUpdatePage<unknown>,
> implements IAppointmentFormPageController {
  constructor(
    protected readonly page: TPage,
    protected readonly appointmentService: AppointmentService,
    protected readonly appointmentFormService: AppointmentFormService,
    protected readonly sessionService: SessionService,
  ) {}

  showSingle(options?: ShowPageOptions): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointmentParams = req.params as unknown as AppointmentParams

      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      const { formId, form } = options?.form && options?.formId ? options : await this.getForm(req, res)
      const contextData = await this.getContextData({ req, res, form, appointmentOrSession: appointment })
      const originalSearch = Object.fromEntries(Object.entries(req.query).filter(([key]) => key !== 'form')) as Record<
        string,
        string
      >
      const errors = options?.errorViewData?.errors ?? {}
      const viewData = {
        heading: this.page.headingViewData(appointment),
        ...this.page.paths(appointment, formId, originalSearch, undefined, form),
        form: formId,
        ...(await this.getStepViewData({
          req,
          res,
          appointmentOrSession: appointment,
          form,
          formId,
          errors,
          contextData,
        })),
        ...(options?.errorViewData ?? {}),
      }

      return res.render(this.getTemplatePath(), viewData)
    }
  }

  showSession(options?: ShowPageOptions): RequestHandler {
    return async (req: Request, res: Response) => {
      const sessionParams = req.params as unknown as AppointmentOrSessionParams

      const session = await this.sessionService.getSession({
        projectCode: sessionParams.projectCode,
        date: sessionParams.date,
        username: res.locals.user.username,
      })

      const { formId, form } = options?.form && options?.formId ? options : await this.getForm(req, res)
      const contextData = await this.getContextData({ req, res, form, appointmentOrSession: session })
      const originalSearch = Object.fromEntries(Object.entries(req.query).filter(([key]) => key !== 'form')) as Record<
        string,
        string
      >
      const errors = options?.errorViewData?.errors ?? {}
      const viewData = {
        heading: this.page.headingViewData(session),
        ...this.page.paths(session, formId, originalSearch, undefined, form),
        form: formId,
        ...(await this.getStepViewData({
          req,
          res,
          appointmentOrSession: session,
          form,
          formId,
          errors,
          contextData,
        })),
        selectedPeopleCard: this.page.selectedPeopleCard(session, form, formId),
        ...(options?.errorViewData ?? {}),
      }

      return res.render(this.getTemplatePath(), viewData)
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointmentOrSessionParams = req.params as unknown as AppointmentOrSessionParams

      const { formId, form } = await this.getForm(req, res, true)

      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      const contextData = await this.getContextData({ req, res, form, appointmentOrSession })
      const { errors, hasErrors, errorSummary } = this.page.validationErrors(req.body, contextData)

      if (hasErrors) {
        const showPage = appointmentOrSessionParams.appointmentId ? this.showSingle : this.showSession

        return showPage.call(this, {
          errorViewData: { errors, errorSummary },
          form,
          formId,
        })(req, res)
      }

      const updatedForm = await this.page.updateForm(form, req.body, contextData)
      await this.appointmentFormService.saveForm(formId, res.locals.user.username, updatedForm)

      return res.redirect(
        this.page.next({
          ...appointmentOrSessionParams,
          formId,
          form: updatedForm,
        }),
      )
    }
  }

  protected abstract getStepViewData(args: AppointmentStepViewDataParams): Promise<object>

  protected async getContextData(_args: ContextDataParams): Promise<unknown> {
    return {}
  }

  protected async getForm(
    req: Request,
    res: Response,
    _isSubmit: boolean = false,
  ): Promise<{ formId?: string; form: AppointmentOutcomeForm }> {
    const formId = (req.query?.form || req.body?.form)?.toString()

    if (!formId) {
      throw new Error('Form ID is required')
    }

    const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)

    return { formId, form }
  }

  protected abstract getTemplatePath(): string
}
