import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import Offender from '../../models/offender'
import ReferenceDataService from '../../services/referenceDataService'
import paths from '../../paths'
import AttendanceOutcomePage from '../../pages/attendanceOutcomePage'
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
      const offender = new Offender(appointment.offender)

      const page = new AttendanceOutcomePage(_req.body)

      res.render('appointments/update/attendanceOutcome', {
        offender,
        items: page.items(outcomes.contactOutcomes),
        updatePath: paths.appointments.attendanceOutcome({ appointmentId }),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const offender = new Offender(appointment.offender)

      const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)

      const page = new AttendanceOutcomePage(_req.body)
      const validationErrors = page.validationErrors()

      if (Object.keys(validationErrors).length) {
        return res.render('appointments/update/attendanceOutcome', {
          offender,
          errorSummary: generateErrorSummary(validationErrors),
          errors: validationErrors,
          items: page.items(outcomes.contactOutcomes),
        })
      }

      return res.render('appointments/update/logTime', {
        offender,
      })
    }
  }
}
