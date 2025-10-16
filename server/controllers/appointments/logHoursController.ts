import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import Offender from '../../models/offender'
import paths from '../../paths'

export default class LogHoursController {
  constructor(private readonly appointmentService: AppointmentService) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const offender = new Offender(appointment.offender)

      res.render('appointments/update/logHours', {
        offender,
        updatePath: paths.appointments.logHours({ appointmentId }),
        backLink: paths.appointments.attendanceOutcome({ appointmentId }),
      })
    }
  }
}
