import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { EnforcementDto, UpdateAppointmentOutcomeDto } from '../../@types/shared'
import SessionUtils from '../../utils/sessionUtils'

export default class ConfirmController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const page = new ConfirmPage(_req.query)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.name)

      res.render('appointments/update/confirm', page.viewData(appointment, form))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const page = new ConfirmPage(_req.query)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.name)

      const { enforcement } = form

      const isEnforceable = form.contactOutcome.enforceable

      const enforcementData: EnforcementDto = isEnforceable
        ? {
            enforcementActionId: enforcement.action.id,
            respondBy: enforcement.respondBy,
          }
        : undefined

      const didAttend = form.contactOutcome.attended

      const payload: UpdateAppointmentOutcomeDto = {
        deliusId: appointment.id,
        deliusVersionToUpdate: appointment.version,
        alertActive: appointment.alertActive,
        sensitive: appointment.sensitive,
        startTime: form.startTime,
        endTime: form.endTime,
        contactOutcomeCode: form.contactOutcome.code,
        attendanceData: didAttend ? form.attendanceData : undefined,
        enforcementData,
        supervisorOfficerCode: form.supervisor.code,
        notes: form.notes,
        formKeyToDelete: this.appointmentFormService.getFormKey(page.formId),
      }

      await this.appointmentService.saveAppointment(payload, res.locals.user.name)

      _req.flash('success', 'Attendance recorded')
      return res.redirect(SessionUtils.getSessionPath(appointment))
    }
  }
}
