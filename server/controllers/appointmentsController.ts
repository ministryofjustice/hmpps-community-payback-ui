import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../services/appointmentService'
import ProviderService from '../services/providerService'
import paths from '../paths'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'

export default class AppointmentsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly providerService: ProviderService,
  ) {}

  projectDetails(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const supervisors = await this.providerService.getSupervisors({
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        username: res.locals.user.username,
      })

      const page = new CheckProjectDetailsPage()

      res.render('appointments/update/projectDetails', {
        ...page.viewData(appointment, supervisors),
      })
    }
  }

  updateProjectDetails(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      res.redirect(paths.appointments.attendanceOutcome({ appointmentId }))
    }
  }
}
