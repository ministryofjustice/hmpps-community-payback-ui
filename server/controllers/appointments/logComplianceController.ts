import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import { generateErrorSummary } from '../../utils/errorUtils'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentOrSessionParams, IFormPageController } from '../../@types/user-defined'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'

export default class LogComplianceController implements IFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly formService: AppointmentFormService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams
      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      const formId = _req.query.form?.toString()
      const page = new LogCompliancePage(_req.query)
      const form = await this.formService.getForm(formId, res.locals.user.username)

      res.render('appointments/update/logCompliance', page.viewData(appointmentOrSession, form, formId))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams

      const formId = _req.body.form?.toString()
      const page = new LogCompliancePage(_req.body)
      const form = await this.formService.getForm(formId, res.locals.user.username)

      page.validate()

      if (page.hasError) {
        const appointmentOrSession = await getAppointmentOrSession({
          appointmentOrSessionParams,
          res,
          appointmentService: this.appointmentService,
          sessionService: this.sessionService,
        })

        return res.render('appointments/update/logCompliance', {
          ...page.viewData(appointmentOrSession, form, formId),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const toSave = page.updateForm(form)
      await this.formService.saveForm(formId, res.locals.user.username, toSave)

      return res.redirect(page.next({ ...appointmentOrSessionParams, formId, form: toSave }))
    }
  }
}
