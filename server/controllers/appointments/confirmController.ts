import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService, {
  AppointmentOutcomeForm,
  UpdateAppointmentForm,
  UpdateSessionForm,
} from '../../services/forms/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { AppointmentDto, UpdateAppointmentDto } from '../../@types/shared'
import { AppointmentOrSessionParams, AppointmentParams, YesOrNo } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import OffenderService from '../../services/offenderService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'
import NotesUtils from '../../utils/components/notesUtils'
import SessionService from '../../services/sessionService'
import paths from '../../paths'
import HtmlUtils from '../../utils/htmlUtils'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'

export default class ConfirmController extends BaseAppointmentController<ConfirmPage> {
  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
    sessionService: SessionService,
    offenderService: OffenderService,
  ) {
    super(new ConfirmPage(), appointmentService, appointmentFormService, sessionService, offenderService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/confirm'
  }

  protected async getStepViewData({
    appointmentOrSession,
    form,
    formId,
    res,
  }: AppointmentStepViewDataParams): Promise<object> {
    return {
      ...this.page.viewData(appointmentOrSession, form, formId),
      errorList: generateErrorTextList(res.locals.errorMessages),
      preventDoubleClick: true,
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { username } = res.locals.user

      const appointmentParams = _req.params as unknown as AppointmentParams

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentParams.projectCode,
      })

      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username,
      })

      const formId = _req.body.form?.toString()
      const alertPractitioner = (_req.body.alertPractitioner as YesOrNo) || undefined

      const form = (await this.appointmentFormService.getForm(
        formId,
        res.locals.user.username,
      )) as UpdateAppointmentForm
      const didAttend = form.contactOutcome.attended
      if (this.appointmentHasChangedSinceLoaded(form.deliusVersion, appointment)) {
        _req.flash('error', 'The arrival time has already been updated in the database, try again.')
        return res.redirect(
          this.page.exitForm({
            projectCode: appointment.projectCode,
            date: appointment.date,
            project,
            originalSearch: form.originalSearch,
          }),
        )
      }

      const payload = this.buildAppointmentUpdate(
        form.deliusVersion,
        form,
        appointment,
        this.page,
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

        return res.redirect(
          this.page.exitForm({
            projectCode: appointment.projectCode,
            date: appointment.date,
            project,
            originalSearch: form.originalSearch,
          }),
        )
      } catch (error) {
        return catchApiValidationErrorOrPropagate(_req, res, error, this.page.updatePath(appointment, formId))
      }
    }
  }

  submitSession(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const sessionParams = _req.params as unknown as AppointmentOrSessionParams

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: sessionParams.projectCode,
      })

      const formId = _req.body.form?.toString()
      const alertPractitioner = (_req.body.alertPractitioner as YesOrNo) || undefined

      const form = (await this.appointmentFormService.getForm(formId, res.locals.user.username)) as UpdateSessionForm
      const didAttend = form.contactOutcome.attended
      const updates = await Promise.all(
        form.appointments.map(async formAppointment => {
          const appointment = await this.appointmentService.getAppointment({
            projectCode: sessionParams.projectCode,
            appointmentId: formAppointment.id.toString(),
            username: res.locals.user.username,
          })

          return this.buildAppointmentUpdate(
            formAppointment.deliusVersion,
            form,
            appointment,
            this.page,
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
          message = this.changedProjectMessage(message, form.project, sessionParams.date)
        }
        _req.flash('success', message)
      } else {
        _req.flash(
          'error',
          'Some information could not be bulk updated. Update the missing attendance outcomes individually',
        )
      }

      return res.redirect(
        this.page.exitForm({
          projectCode: sessionParams.projectCode,
          date: sessionParams.date,
          project,
          originalSearch: form.originalSearch,
        }),
      )
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
