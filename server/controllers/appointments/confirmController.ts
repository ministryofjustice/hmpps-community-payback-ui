import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { UpdateAppointmentOutcomeDto } from '../../@types/shared'
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

      res.render('appointments/update/confirm', page.viewData(appointment, form.data))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const page = new ConfirmPage(_req.query)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.name)

      const payload: UpdateAppointmentOutcomeDto = {
        deliusId: appointment.id,
        deliusVersionToUpdate: appointment.version,
        alertActive: appointment.alertActive,
        sensitive: appointment.sensitive,
        startTime: form.data.startTime,
        endTime: form.data.endTime,
        contactOutcomeId: form.data.contactOutcome.id,
        attendanceData: form.data.attendanceData,
        supervisorOfficerCode: form.data.supervisorOfficerCode,
        notes: form.data.notes,
        formKeyToDelete: form.key,
      }

      await this.appointmentService.saveAppointment(payload, res.locals.user.name)

      _req.flash('success', 'Attendance recorded')
      return res.redirect(SessionUtils.getSessionPath(appointment))
    }
  }
}
