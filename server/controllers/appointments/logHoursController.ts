import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import { generateErrorSummary } from '../../utils/errorUtils'
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

      const page = new LogHoursPage(_req.query)

      const form = await this.formService.getForm(page.formId, res.locals.user.username)

      res.render('appointments/update/logHours', {
        ...page.viewData(appointment, form),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams

      const page = new LogHoursPage(_req.body)
      page.validate()

      const form = await this.formService.getForm(page.formId, res.locals.user.username)

      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      if (page.hasErrors) {
        return res.render('appointments/update/logHours', {
          ...page.viewData(appointmentOrSession, form),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const toSave = page.updateForm(form)
      await this.formService.saveForm(page.formId, res.locals.user.username, toSave)

      return res.redirect(page.next(appointmentOrSessionParams))
    }
  }
}
