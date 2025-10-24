import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import generateErrorSummary from '../../utils/errorUtils'

export default class LogComplianceController {
  constructor(private readonly appointmentService: AppointmentService) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const page = new LogCompliancePage()

      res.render('appointments/update/logCompliance', page.viewData(appointment))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const page = new LogCompliancePage(_req.body)
      page.validate()

      if (page.hasError) {
        const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

        return res.render('appointments/update/logCompliance', {
          ...page.viewData(appointment),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      return res.redirect(page.next(appointmentId))
    }
  }
}
