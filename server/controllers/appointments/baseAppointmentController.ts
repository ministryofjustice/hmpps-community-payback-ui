import type { Request, RequestHandler, Response } from 'express'
import BaseAppointmentUpdatePage from '../../pages/appointments/baseAppointmentUpdatePage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService, {
  AppointmentOutcomeForm,
  CreateAppointmentForm,
  UpdateAppointmentForm,
} from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import {
  AppointmentParams,
  AppointmentOrSessionParams,
  ValidationErrors,
  IAppointmentFormPageController,
} from '../../@types/user-defined'
import { ErrorViewData } from '../../utils/errorUtils'
import { AppointmentDto, OffenderDto, SessionDto } from '../../@types/shared'
import OffenderService from '../../services/offenderService'
import { newAppointmentId } from '../../pages/appointments/pathMap'

export type AppointmentStepViewDataParams = {
  req: Request
  res: Response
  appointment?: AppointmentDto
  appointmentSummaries?: SessionDto['appointmentSummaries']
  form: AppointmentOutcomeForm
  formId?: string
  errors: ValidationErrors<unknown>
  contextData?: unknown
  isSingleAppointment: boolean
}

export type ContextDataParams = {
  req: Request
  res: Response
  form: AppointmentOutcomeForm
}

type ShowPageOptions = {
  errorViewData?: Pick<ErrorViewData<unknown>, 'errors' | 'errorSummary'>
  form?: AppointmentOutcomeForm
  formId?: string
  contextData: unknown
}

export default abstract class BaseAppointmentController<
  TPage extends BaseAppointmentUpdatePage<unknown>,
> implements IAppointmentFormPageController {
  constructor(
    protected readonly page: TPage,
    protected readonly appointmentService: AppointmentService,
    protected readonly appointmentFormService: AppointmentFormService,
    protected readonly sessionService: SessionService,
    protected readonly offenderService: OffenderService,
  ) {}

  showSingle(options?: ShowPageOptions): RequestHandler {
    return async (req: Request, res: Response) => {
      const { username } = res.locals.user
      const appointmentParams = req.params as unknown as AppointmentParams
      const isNewAppointment = this.isNewAppointment(appointmentParams)

      const { formId, form } = await this.getForm(req, res, options)

      const appointment = !isNewAppointment
        ? await this.appointmentService.getAppointment({
            ...appointmentParams,
            username,
          })
        : undefined

      const offender = await this.getOffender(username, form, appointment)

      const contextData = options?.contextData ? options.contextData : await this.getContextData({ req, res, form })

      const errors = options?.errorViewData?.errors ?? {}

      const viewData = {
        heading: this.page.offenderHeading(offender),
        ...this.page.paths({
          projectCode: appointmentParams.projectCode,
          appointmentId: appointmentParams.appointmentId,
          formId,
          form,
        }),
        form: formId,
        ...(await this.getStepViewData({
          req,
          res,
          appointment,
          form,
          formId,
          errors,
          contextData,
          isSingleAppointment: true,
        })),
        ...(options?.errorViewData ?? {}),
      }

      return res.render(this.getTemplatePath(), viewData)
    }
  }

  private isNewAppointment(appointmentParams: Pick<AppointmentOrSessionParams, 'appointmentId'>) {
    return appointmentParams.appointmentId === newAppointmentId
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
      const contextData = options?.contextData ? options.contextData : await this.getContextData({ req, res, form })

      const errors = options?.errorViewData?.errors ?? {}
      const viewData = {
        heading: this.page.sessionUpdateHeading(session.projectName, session.date),
        ...this.page.paths({
          projectCode: session.projectCode,
          date: session.date,
          formId,
          form,
        }),
        form: formId,
        ...(await this.getStepViewData({
          req,
          res,
          form,
          formId,
          errors,
          contextData,
          appointmentSummaries: session.appointmentSummaries,
          isSingleAppointment: false,
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
      const { formId, form } = await this.getForm(req, res)

      const contextData = await this.getContextData({ req, res, form })
      const { errors, hasErrors, errorSummary } = this.page.validationErrors(req.body, contextData)

      if (hasErrors) {
        const showPage = appointmentOrSessionParams.appointmentId ? this.showSingle : this.showSession

        return showPage.call(this, {
          errorViewData: { errors, errorSummary },
          form,
          formId,
          contextData,
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
    options?: ShowPageOptions,
  ): Promise<{ formId?: string; form: CreateAppointmentForm | UpdateAppointmentForm }> {
    if (options?.formId && options?.form) {
      return { form: options.form, formId: options.formId }
    }
    const formId = (req.query?.form || req.body?.form)?.toString()

    if (!formId) {
      throw new Error('Form ID is required')
    }

    const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)

    return { formId, form }
  }

  protected abstract getTemplatePath(): string

  private async getOffender(
    username: string,
    form: CreateAppointmentForm | UpdateAppointmentForm,
    appointment?: AppointmentDto,
  ): Promise<OffenderDto> {
    if (appointment) {
      return appointment.offender
    }

    if ('crn' in form && form.crn) {
      const offender = await this.offenderService.getOffenderSummary({ username, crn: form.crn })
      return offender.offender
    }

    throw new Error('CRN must be selected to start a new appointment form')
  }
}
