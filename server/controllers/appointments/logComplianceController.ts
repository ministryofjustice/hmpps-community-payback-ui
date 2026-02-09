import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import { generateErrorSummary } from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'
import { AppointmentParams } from '../../@types/user-defined'

export default class LogComplianceController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly formService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointment = await this.appointmentService.getAppointment({
        ...(_req.params as unknown as AppointmentParams),
        username: res.locals.user.username,
      })

      const page = new LogCompliancePage(_req.query)
      const form = await this.formService.getForm(page.formId, res.locals.user.username)

      res.render('appointments/update/logCompliance', page.viewData(appointment, form))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const page = new LogCompliancePage(_req.body)
      const form = await this.formService.getForm(page.formId, res.locals.user.username)
      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      page.validate()

      if (page.hasError) {
        return res.render('appointments/update/logCompliance', {
          ...page.viewData(appointment, form),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const toSave = page.updateForm(form)
      await this.formService.saveForm(page.formId, res.locals.user.username, toSave)

      return res.redirect(page.next(appointment))
    }
  }
}
