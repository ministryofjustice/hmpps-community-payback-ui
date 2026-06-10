import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { AppointmentDto, UpdateAppointmentOutcomeDto } from '../../@types/shared'
import { AppointmentOrSessionParams, AppointmentOutcomeForm, IFormPageController } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'
import NotesUtils from '../../utils/notesUtils'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'

export default class ConfirmController implements IFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = _req.params as unknown as AppointmentOrSessionParams
      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      const page = new ConfirmPage(_req.query)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)
      const errorList = generateErrorTextList(res.locals.errorMessages)
      const preventDoubleClick = true

      res.render('appointments/update/confirm', {
        ...page.viewData(appointmentOrSession, form),
        errorList,
        preventDoubleClick,
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode, appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode,
      })

      const page = new ConfirmPage(_req.body)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      if (this.appointmentHasChangedSinceLoaded(form, appointment)) {
        _req.flash('error', 'The arrival time has already been updated in the database, try again.')
        return res.redirect(page.exitForm(appointment, project, form.originalSearch))
      }

      const didAttend = form.contactOutcome.attended

      const payload: UpdateAppointmentOutcomeDto = {
        ...NotesUtils.requestBody(form, appointment.sensitive),
        deliusId: appointment.id,
        deliusVersionToUpdate: appointment.version,
        alertActive: page.isAlertSelected ?? appointment.alertActive,
        startTime: form.startTime,
        endTime: form.endTime,
        contactOutcomeCode: form.contactOutcome.code,
        attendanceData: didAttend ? form.attendanceData : undefined,
        supervisorOfficerCode: form.supervisor.code,
        date: appointment.date,
      }

      try {
        await this.appointmentService.saveAppointment(appointment.projectCode, payload, res.locals.user.username)

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: appointment.offender.crn,
        }

        _req.flash('success', 'Attendance recorded')
        return res.redirect(page.exitForm(appointment, project, form.originalSearch))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(_req, res, error, page.updatePath(appointment))
      }
    }
  }

  private appointmentHasChangedSinceLoaded(form: AppointmentOutcomeForm, appointment: AppointmentDto): boolean {
    return form.deliusVersion !== appointment.version
  }
}
