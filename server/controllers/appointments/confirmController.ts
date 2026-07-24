import type { NextFunction, Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService, {
  AppointmentOutcomeForm,
  CreateAppointmentForm,
} from '../../services/forms/appointmentFormService'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { AppointmentDto, UpdateAppointmentDto } from '../../@types/shared'
import { AppointmentOrSessionParams, IAppointmentFormPageController } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'
import NotesUtils from '../../utils/components/notesUtils'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'
import paths from '../../paths'
import HtmlUtils from '../../utils/htmlUtils'
import AuditService, { Page } from '../../services/auditService'
import OffenderService from '../../services/offenderService'

export default class ConfirmController implements IAppointmentFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly offenderService: OffenderService,
  ) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointmentParams = { projectCode: req.params.projectCode.toString(), appointmentId: 'create' }

      const formId = req.query.form?.toString()
      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      const page = new ConfirmPage()

      const navigationPaths = page.paths({
        pathData: appointmentParams,
        form,
        formId,
      })

      const offenderSummary = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn: (form as CreateAppointmentForm).crn,
      })

      const errorList = generateErrorTextList(res.locals.errorMessages)
      const preventDoubleClick = true
      const pathData = { ...appointmentParams, date: form.date }

      res.render('appointments/update/confirm', {
        heading: page.offenderHeading(offenderSummary.offender),
        ...navigationPaths,
        ...page.viewData(undefined, pathData, form, formId, { includeDateItem: true }),
        errorList,
        preventDoubleClick,
      })
    }
  }

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
      const pathData = { ...appointmentOrSessionParams, date: appointmentOrSession.date }

      res.render('appointments/update/confirm', {
        ...page.commonViewData({ pathData, appointmentOrSession, form, formId }),
        ...page.viewData(appointmentOrSession, pathData, form, formId),
        errorList,
        preventDoubleClick,
      })
    }
  }

  submitCreate(): RequestHandler {
    return async (_req: Request, _res: Response, next: NextFunction) => {
      return next()
    }
  }

  submitUpdate(): RequestHandler {
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
      const isAlertSelected = page.isAlertSelected(_req.body)

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
          isAlertSelected,
          didAttend,
          false,
        )

        try {
          await this.appointmentService.saveAppointment(appointment.projectCode, payload, res.locals.user.username)

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
          return catchApiValidationErrorOrPropagate(
            _req,
            res,
            error,
            page.updatePath(appointmentOrSessionParams, formId),
          )
        }
      } else {
        const updates = await Promise.all(
          form.appointments.map(async formAppointment => {
            const appointment = await this.appointmentService.getAppointment({
              projectCode: appointmentOrSessionParams.projectCode,
              appointmentId: formAppointment.id.toString(),
              username: res.locals.user.username,
            })

            this.auditService.sendAuditMessage({
              action: Page.EDIT_APPOINTMENT,
              username: res.locals.user.username,
              details: _req.params,
              correlationId: _req.id,
              subjectType: 'CRN',
              subjectId: appointment.offender.crn,
            })

            return this.buildAppointmentUpdate(
              formAppointment.deliusVersion,
              form,
              appointment,
              isAlertSelected,
              didAttend,
              true,
            )
          }),
        )

        try {
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
        } catch (error) {
          return catchApiValidationErrorOrPropagate(
            _req,
            res,
            error,
            page.updatePath(appointmentOrSessionParams, formId),
          )
        }
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
    isAlertSelected: boolean | null,
    didAttend: boolean,
    isBulk: boolean,
  ): UpdateAppointmentDto {
    const allowSensitiveUpdate = !isBulk
    return {
      ...NotesUtils.requestBody(form, appointment.sensitive, allowSensitiveUpdate),
      deliusId: appointment.id,
      deliusVersionToUpdate,
      alertActive: isAlertSelected ?? appointment.alertActive,
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
