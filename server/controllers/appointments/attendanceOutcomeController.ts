import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import generateErrorSummary from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'
import { AppointmentParams } from '../../@types/user-defined'

export default class AttendanceOutcomeController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly formService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointment = await this.appointmentService.getAppointment({
        ...(_req.params as unknown as AppointmentParams),
        username: res.locals.user.username,
      })
      const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)

      const page = new AttendanceOutcomePage({
        query: _req.query,
        appointment,
        contactOutcomes: outcomes.contactOutcomes,
      })
      res.render('appointments/update/attendanceOutcome', page.viewData())
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })
      const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)

      const page = new AttendanceOutcomePage({
        query: _req.body,
        appointment,
        contactOutcomes: outcomes.contactOutcomes,
      })
      const validationErrors = page.validationErrors()

      if (Object.keys(validationErrors).length) {
        return res.render('appointments/update/attendanceOutcome', {
          ...page.viewData(),
          errorSummary: generateErrorSummary(validationErrors),
          errors: validationErrors,
        })
      }

      const form = await this.formService.getForm(page.formId, res.locals.user.name)
      const toSave = page.updateForm(form, outcomes.contactOutcomes)
      await this.formService.saveForm(page.formId, res.locals.user.name, toSave)

      return res.redirect(page.next(appointmentParams.projectCode, appointmentParams.appointmentId))
    }
  }
}
