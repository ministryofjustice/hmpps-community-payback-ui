import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { AppointmentDto, UpdateAppointmentOutcomeDto } from '../../@types/shared'
import SessionUtils from '../../utils/sessionUtils'
import { AppointmentOutcomeForm, AppointmentParams } from '../../@types/user-defined'

export default class ConfirmController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointment = await this.appointmentService.getAppointment({
        ...(_req.params as unknown as AppointmentParams),
        username: res.locals.user.username,
      })

      const page = new ConfirmPage(_req.query)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      res.render('appointments/update/confirm', page.viewData(appointment, form))
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointment = await this.appointmentService.getAppointment({
        ...(_req.params as unknown as AppointmentParams),
        username: res.locals.user.username,
      })

      const page = new ConfirmPage(_req.query)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      if (this.appointmentHasChangedSinceLoaded(form, appointment)) {
        _req.flash('error', 'The arrival time has already been updated in the database, try again.')
        return res.redirect(SessionUtils.getSessionPath(appointment))
      }

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
        supervisorOfficerCode: form.supervisor.code,
        notes: form.notes,
        formKeyToDelete: this.appointmentFormService.getFormKey(page.formId),
      }

      await this.appointmentService.saveAppointment(appointment.projectCode, payload, res.locals.user.username)

      _req.flash('success', 'Attendance recorded')
      return res.redirect(page.next(appointment))
    }
  }

  private appointmentHasChangedSinceLoaded(form: AppointmentOutcomeForm, appointment: AppointmentDto): boolean {
    return form.deliusVersion !== appointment.version
  }
}
