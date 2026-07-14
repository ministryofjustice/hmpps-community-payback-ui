import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage, { AttendanceOutcomeBody } from '../../pages/appointments/attendanceOutcomePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentOrSessionParams, IFormPageController } from '../../@types/user-defined'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'

export default class AttendanceOutcomeController implements IFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly formService: AppointmentFormService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams
      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })
      const outcomes = await this.referenceDataService.getAvailableContactOutcomes(res.locals.user.username)

      const formId = _req.query.form?.toString()
      const page = new AttendanceOutcomePage()

      const form = await this.formService.getForm(formId, res.locals.user.username)

      res.render(
        'appointments/update/attendanceOutcome',
        page.viewData(appointmentOrSession, form, outcomes.contactOutcomes, formId, _req.query),
      )
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams

      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })
      const outcomes = await this.referenceDataService.getAvailableContactOutcomes(res.locals.user.username)

      const formId = _req.body.form?.toString()
      const page = new AttendanceOutcomePage()
      const form = await this.formService.getForm(formId, res.locals.user.username)
      const { hasErrors, errors, errorSummary } = page.validationErrors(_req.body, {
        appointmentOrSession,
        contactOutcomes: outcomes.contactOutcomes,
      })

      if (hasErrors) {
        return res.render('appointments/update/attendanceOutcome', {
          ...page.viewData(
            appointmentOrSession,
            form,
            outcomes.contactOutcomes,
            formId,
            _req.body as AttendanceOutcomeBody,
          ),
          errorSummary,
          errors,
        })
      }

      const toSave = page.updateForm(form, outcomes.contactOutcomes, _req.body)
      await this.formService.saveForm(formId, res.locals.user.username, toSave)

      return res.redirect(page.next({ ...appointmentOrSessionParams, formId, form: toSave }))
    }
  }
}
