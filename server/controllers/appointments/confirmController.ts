import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { AppointmentDto, UpdateAppointmentDto } from '../../@types/shared'
import {
  AppointmentOrSessionParams,
  AppointmentOutcomeForm,
  IFormPageController,
  YesOrNo,
} from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'
import NotesUtils from '../../utils/components/notesUtils'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'
import paths from '../../paths'
import HtmlUtils from '../../utils/htmlUtils'

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

      const page = new ConfirmPage()
      const formId = _req.query.form?.toString()
      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      const errorList = generateErrorTextList(res.locals.errorMessages)
      const preventDoubleClick = true

      res.render('appointments/update/confirm', {
        ...page.viewData(appointmentOrSession, form, formId),
        errorList,
        preventDoubleClick,
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = _req.params as unknown as AppointmentOrSessionParams

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentOrSessionParams.projectCode,
      })

      const appointmentOrSession = await getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService: this.appointmentService,
        sessionService: this.sessionService,
      })

      const page = new ConfirmPage()
      const formId = _req.body.form?.toString()
      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      const didAttend = form.contactOutcome.attended
      const alertPractitioner = (_req.body.alertPractitioner as YesOrNo) || undefined

      if (appointmentOrSessionParams.appointmentId) {
        const appointment = appointmentOrSession as AppointmentDto
        if (this.appointmentHasChangedSinceLoaded(form.deliusVersion, appointment)) {
          _req.flash('error', 'The arrival time has already been updated in the database, try again.')
          return res.redirect(page.exitForm(appointment, project, form.originalSearch))
        }

        const payload = this.buildAppointmentUpdate(
          form.deliusVersion,
          form,
          appointment,
          page,
          didAttend,
          false,
          alertPractitioner,
        )

        try {
          await this.appointmentService.saveAppointment(appointment.projectCode, payload, res.locals.user.username)

          // TODO: how is this sent? Does it need an audit event set on the router?
          res.locals.audit = {
            subjectType: 'CRN',
            subjectId: appointment.offender.crn,
          }

          let message = 'Attendance recorded'

          if (project.projectCode !== form.project.code) {
            message = this.changedProjectMessage(message, form.project, appointment.date)
          }

          _req.flash('success', message)
          return res.redirect(page.exitForm(appointment, project, form.originalSearch))
        } catch (error) {
          return catchApiValidationErrorOrPropagate(_req, res, error, page.updatePath(appointment, formId))
        }
      } else {
        const updates = await Promise.all(
          form.appointments.map(async formAppointment => {
            const appointment = await this.appointmentService.getAppointment({
              projectCode: appointmentOrSessionParams.projectCode,
              appointmentId: formAppointment.id.toString(),
              username: res.locals.user.username,
            })

            return this.buildAppointmentUpdate(
              formAppointment.deliusVersion,
              form,
              appointment,
              page,
              didAttend,
              true,
              alertPractitioner,
            )
          }),
        )

        const result = await this.appointmentService.saveAppointments(
          project.projectCode,
          { updates },
          res.locals.user.username,
        )

        if (result.results.every(appointmentResult => appointmentResult.result === 'SUCCESS')) {
          let message = 'Attendance recorded for all selected people'
          if (project.projectCode !== form.project.code) {
            message = this.changedProjectMessage(message, form.project, appointmentOrSessionParams.date)
          }

          _req.flash('success', message)
        } else {
          _req.flash(
            'error',
            'Some information could not be bulk updated. Update the missing attendance outcomes individually',
          )
        }

        return res.redirect(page.exitForm(appointmentOrSession, project, form.originalSearch))
      }
    }
  }

  private changedProjectMessage(message: string, project: AppointmentOutcomeForm['project'], date: string) {
    const path = paths.sessions.show({ projectCode: project.code, date })
    return `${message} on a different session. ${HtmlUtils.getAnchor('View session', path)}`
  }

  private buildAppointmentUpdate(
    deliusVersionToUpdate: string,
    form: AppointmentOutcomeForm,
    appointment: AppointmentDto,
    page: ConfirmPage,
    didAttend: boolean,
    isBulk: boolean,
    alertPractitioner?: YesOrNo,
  ): UpdateAppointmentDto {
    const allowSensitiveUpdate = !isBulk
    return {
      ...NotesUtils.requestBody(form, appointment.sensitive, allowSensitiveUpdate),
      deliusId: appointment.id,
      deliusVersionToUpdate,
      alertActive: page.getAlertSelected(alertPractitioner) ?? appointment.alertActive,
      startTime: form.startTime || appointment.startTime,
      endTime: form.endTime || appointment.endTime,
      contactOutcomeCode: form.contactOutcome.code,
      attendanceData: didAttend ? form.attendanceData : undefined,
      supervisorOfficerCode: form.supervisor.code,
      date: appointment.date,
      projectCode: form.project.code,
    }
  }

  private appointmentHasChangedSinceLoaded(formDeliusVersion: string, appointment: AppointmentDto): boolean {
    return formDeliusVersion !== appointment.version
  }
}
