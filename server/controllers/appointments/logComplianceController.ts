import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'

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
}
