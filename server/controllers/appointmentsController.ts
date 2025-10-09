import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../services/appointmentService'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'

export default class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  update(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const offender = new Offender(appointment.offender)

      const project = {
        name: appointment.projectName,
        type: appointment.projectTypeName,
        supervisingTeam: appointment.supervisingTeam,
        dateAndTime: DateTimeFormats.dateAndTimePeriod(appointment.date, appointment.startTime, appointment.endTime),
      }

      res.render('appointments/update/projectDetails', {
        project,
        offender,
      })
    }
  }
}
