import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ConfirmPage from '../../pages/appointments/confirmPage'

export default class ConfirmController {
  constructor(private readonly appointmentService: AppointmentService) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const page = new ConfirmPage()

      res.render('appointments/update/confirm', {
        ...page.viewData(appointment),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      return res.redirect('/')
    }
  }
}
