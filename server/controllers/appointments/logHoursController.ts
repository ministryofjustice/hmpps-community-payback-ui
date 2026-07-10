import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentOrSessionParams, IFormPageController } from '../../@types/user-defined'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'

export default class LogHoursController implements IFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly formService: AppointmentFormService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams
      const appointment = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      const formId = _req.query.form?.toString()
      const page = new LogHoursPage()

      const form = await this.formService.getForm(formId, res.locals.user.username)

      res.render('appointments/update/logHours', {
        ...page.viewData(appointment, form, {}, formId),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams

      const formId = _req.body.form?.toString()
      const page = new LogHoursPage()
      const { hasErrors, errors, errorSummary } = page.validationErrors(_req.body)

      const form = await this.formService.getForm(formId, res.locals.user.username)

      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      if (hasErrors) {
        return res.render('appointments/update/logHours', {
          ...page.viewData(appointmentOrSession, form, _req.body, formId),
          errors,
          errorSummary,
        })
      }

      const toSave = page.updateForm(form, _req.body)
      await this.formService.saveForm(formId, res.locals.user.username, toSave)

      return res.redirect(page.next({ ...appointmentOrSessionParams, formId }))
    }
  }
}
