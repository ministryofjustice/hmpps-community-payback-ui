import type { Request, RequestHandler, Response } from 'express'
import BaseAppointmentUpdatePage from '../../pages/appointments/baseAppointmentUpdatePage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import {
  AppointmentOrSessionParams,
  AppointmentOrSession,
  AppointmentOutcomeForm,
  ValidationErrors,
  IFormPageController,
} from '../../@types/user-defined'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'

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

export default abstract class BaseAppointmentController<
  TPage extends BaseAppointmentUpdatePage<unknown>,
> implements IFormPageController {
  constructor(
    protected readonly page: TPage,
    protected readonly appointmentService: AppointmentService,
    protected readonly appointmentFormService: AppointmentFormService,
    protected readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointmentOrSessionParams = req.params as unknown as AppointmentOrSessionParams

      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      const { formId, form } = await this.getForm(req, res)
      const contextData = await this.getContextData({ req, res, form, appointmentOrSession })

      const viewData = await this.getStepViewData({
        req,
        res,
        appointmentOrSession,
        form,
        formId,
        errors: {},
        contextData,
      })

      res.render(this.getTemplatePath(), viewData)
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
        const viewData = {
          ...(await this.getStepViewData({
            req,
            res,
            appointmentOrSession,
            form,
            formId,
            errors,
            contextData,
          })),
          errorSummary,
          errors,
        }

        return res.render(this.getTemplatePath(), viewData)
      }

      const updatedForm = await this.page.updateForm(form, req.body, contextData)
      await this.appointmentFormService.saveForm(formId, res.locals.user.username, updatedForm)

      return res.redirect(
        this.page.next({
          ...appointmentOrSessionParams,
          formId,
        }),
      )
    }
  }

  protected abstract getStepViewData(args: AppointmentStepViewDataParams): Promise<object>

  protected async getContextData(args: ContextDataParams): Promise<unknown> {
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
