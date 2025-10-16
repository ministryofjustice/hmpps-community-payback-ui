import type { Request, RequestHandler, Response } from 'express'
import Offender from '../../models/offender'
import paths from '../../paths'
import AppointmentService from '../../services/appointmentService'

export default class LogComplianceController {
  constructor(private readonly appointmentService: AppointmentService) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const offender = new Offender(appointment.offender)

      res.render('appointments/update/logCompliance', {
        offender,
        backLink: paths.appointments.logHours({ appointmentId }),
        updatePath: paths.appointments.logCompliance({ appointmentId: appointment.id.toString() }),
      })
    }
  }
}
