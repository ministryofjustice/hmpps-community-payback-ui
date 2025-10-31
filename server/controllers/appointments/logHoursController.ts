import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import generateErrorSummary from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'

export default class LogHoursController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly formService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const page = new LogHoursPage(_req.query)

      res.render('appointments/update/logHours', {
        ...page.viewData(appointment),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const page = new LogHoursPage(_req.body)
      page.validate()

      if (page.hasErrors) {
        const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
        return res.render('appointments/update/logHours', {
          ...page.viewData(appointment),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const form = await this.formService.getForm(page.formId, res.locals.user.name)
      const toSave = page.form(form)
      await this.formService.saveForm(page.formId, res.locals.user.name, toSave)

      return res.redirect(page.next(appointmentId))
    }
  }
}
