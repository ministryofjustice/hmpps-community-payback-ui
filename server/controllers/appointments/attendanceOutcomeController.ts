import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import AttendanceOutcomePage, { AttendanceOutcomeQuery } from '../../pages/appointments/attendanceOutcomePage'
import { generateErrorSummary } from '../../utils/errorUtils'
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
        page.viewData(
          form,
          false,
          _req.query as AttendanceOutcomeQuery,
          appointmentOrSession,
          outcomes.contactOutcomes,
          formId,
        ),
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
      const validationErrors = page.validationErrors(
        _req.body as AttendanceOutcomeQuery,
        appointmentOrSession,
        outcomes.contactOutcomes,
      )

      if (Object.keys(validationErrors).length) {
        return res.render('appointments/update/attendanceOutcome', {
          ...page.viewData(
            form,
            true,
            _req.body as AttendanceOutcomeQuery,
            appointmentOrSession,
            outcomes.contactOutcomes,
            formId,
          ),
          errorSummary: generateErrorSummary(validationErrors),
          errors: validationErrors,
        })
      }

      const toSave = page.updateForm(form, outcomes.contactOutcomes, _req.body as AttendanceOutcomeQuery)
      await this.formService.saveForm(formId, res.locals.user.username, toSave)

      return res.redirect(page.next({ ...appointmentOrSessionParams, formId }))
    }
  }
}
