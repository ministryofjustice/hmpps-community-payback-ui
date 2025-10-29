import type { Request, RequestHandler, Response } from 'express'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'

export default class EnforcementController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const enforcementActions = await this.referenceDataService.getEnforcementActions(res.locals.user.name)

      const page = new EnforcementPage(_req.query)

      res.render('appointments/update/enforcement', page.viewData(appointment, enforcementActions))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const page = new EnforcementPage(_req.body)

      return res.redirect(page.next(appointmentId))
    }
  }
}
