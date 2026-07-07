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

      const originalSearch = Object.fromEntries(Object.entries(req.query).filter(([key]) => key !== 'form')) as Record<
        string,
        string
      >

      const viewData = {
        ...this.page.paths(appointmentOrSession, formId, originalSearch, undefined, form),
        form: formId,
        heading: this.page.headingViewData(appointmentOrSession),
        selectedPeopleCard: this.page.selectedPeopleCard(appointmentOrSession, form, formId),
        ...(await this.getStepViewData({
          req,
          res,
          appointmentOrSession,
          form,
          formId,
          errors: {},
          contextData,
        })),
      }

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
        const originalSearch = Object.fromEntries(
          Object.entries(req.query).filter(([key]) => key !== 'form'),
        ) as Record<string, string>

        const viewData = {
          heading: this.page.headingViewData(appointmentOrSession),
          ...this.page.paths(appointmentOrSession, formId, originalSearch, undefined, form),
          form: formId,
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
          selectedPeopleCard: this.page.selectedPeopleCard(appointmentOrSession, form, formId),
        }

        return res.render(this.getTemplatePath(), viewData)
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
