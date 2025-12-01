import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import generateErrorSummary from '../../utils/errorUtils'
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

      res.render('appointments/update/logCompliance', page.viewData(appointment))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId, projectCode } = _req.params
      const page = new LogCompliancePage(_req.body)
      page.validate()

      if (page.hasError) {
        const appointment = await this.appointmentService.getAppointment({
          appointmentId,
          projectCode,
          username: res.locals.user.username,
        })

        return res.render('appointments/update/logCompliance', {
          ...page.viewData(appointment),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const form = await this.formService.getForm(page.formId, res.locals.user.name)
      const toSave = page.updateForm(form)
      await this.formService.saveForm(page.formId, res.locals.user.name, toSave)

      return res.redirect(page.next(projectCode, appointmentId))
    }
  }
}
