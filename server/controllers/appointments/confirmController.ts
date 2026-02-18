import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { AppointmentDto, UpdateAppointmentOutcomeDto } from '../../@types/shared'
import { AppointmentOutcomeForm, AppointmentParams } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'

export default class ConfirmController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
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
      const appointmentParams = _req.params as unknown as AppointmentParams
      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentParams.projectCode,
      })

      const page = new ConfirmPage(_req.body)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      if (this.appointmentHasChangedSinceLoaded(form, appointment)) {
        _req.flash('error', 'The arrival time has already been updated in the database, try again.')
        return res.redirect(page.exitForm(appointment, project))
      }

      const didAttend = form.contactOutcome.attended

      const payload: UpdateAppointmentOutcomeDto = {
        deliusId: appointment.id,
        deliusVersionToUpdate: appointment.version,
        alertActive: page.isAlertSelected ?? appointment.alertActive,
        sensitive: form.sensitive,
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
      return res.redirect(page.exitForm(appointment, project))
    }
  }

  private appointmentHasChangedSinceLoaded(form: AppointmentOutcomeForm, appointment: AppointmentDto): boolean {
    return form.deliusVersion !== appointment.version
  }
}
