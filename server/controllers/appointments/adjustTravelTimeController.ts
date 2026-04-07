import type { Request, RequestHandler, Response } from 'express'
import paths from '../../paths'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AppointmentService from '../../services/appointmentService'

export default class AdjustTravelTimeController {
  constructor(
    private readonly page: UpdateTravelTimePage,
    private readonly appointmentService: AppointmentService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('appointments/update/adjustTravelTime')
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId } = req.params
      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const viewData = this.page.viewData(appointment)

      res.render('appointments/update/travelTime/update', viewData)
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId } = req.params
      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      if (hasErrors) {
        const { hours, minutes } = req.body
        const time = {
          hours,
          minutes,
        }

        const appointment = await this.appointmentService.getAppointment({
          projectCode,
          appointmentId,
          username: res.locals.user.username,
        })

        const viewData = {
          ...this.page.viewData(appointment),
          errorSummary,
          errors,
          time,
        }

        return res.render('appointments/update/travelTime/update', viewData)
      }
      return res.redirect(paths.appointments.adjustTravelTime({}))
    }
  }
}
