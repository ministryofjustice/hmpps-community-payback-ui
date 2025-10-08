import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../services/appointmentService'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'
import ReferenceDataService from '../services/referenceDataService'
import paths from '../paths'

export default class AppointmentsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  projectDetails(): RequestHandler {
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

  attendanceOutcome(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)
      const offender = new Offender(appointment.offender)

      const outcomeItems = outcomes.contactOutcomes.map(outcome => ({ text: outcome.name, value: outcome.id }))

      res.render('appointments/update/attendanceOutcome', {
        offender,
        items: outcomeItems,
        updatePath: paths.appointments.update({ appointmentId }),
      })
    }
  }

  update(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.redirect('/')
    }
  }
}
