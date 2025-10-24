import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import generateErrorSummary from '../../utils/errorUtils'

export default class AttendanceOutcomeController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
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

      return res.redirect(page.next(appointmentId))
    }
  }
}
