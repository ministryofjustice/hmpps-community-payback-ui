import type { Request, RequestHandler, Response } from 'express'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import generateErrorSummary from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'

export default class EnforcementController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly formService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const page = new EnforcementPage(_req.query)

      res.render('appointments/update/enforcement', page.viewData(appointment))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const page = new EnforcementPage(_req.body)
      page.validate()

      if (page.hasErrors) {
        const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
        return res.render('appointments/update/enforcement', {
          ...page.viewData(appointment),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const enforcementActions = await this.referenceDataService.getEnforcementActions(res.locals.user.name)

      const form = await this.formService.getForm(page.formId, res.locals.user.name)
      const toSave = page.form(form, enforcementActions)
      await this.formService.saveForm(page.formId, res.locals.user.name, toSave)

      return res.redirect(page.next(appointmentId))
    }
  }
}
