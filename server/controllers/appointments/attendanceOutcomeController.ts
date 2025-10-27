import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import generateErrorSummary from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'

export default class AttendanceOutcomeController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly formService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)

      const page = new AttendanceOutcomePage(_req.query)
      res.render('appointments/update/attendanceOutcome', page.viewData(appointment, outcomes.contactOutcomes))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const page = new AttendanceOutcomePage(_req.body)
      const validationErrors = page.validationErrors()

      if (Object.keys(validationErrors).length) {
        const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
        const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)

        return res.render('appointments/update/attendanceOutcome', {
          ...page.viewData(appointment, outcomes.contactOutcomes),
          errorSummary: generateErrorSummary(validationErrors),
          errors: validationErrors,
        })
      }

      const form = await this.formService.getForm(page.formId, res.locals.user.name)
      const toSave = page.form(form)
      await this.formService.saveForm(form.key.id, res.locals.user.name, toSave)

      return res.redirect(page.next(appointmentId))
    }
  }
}
