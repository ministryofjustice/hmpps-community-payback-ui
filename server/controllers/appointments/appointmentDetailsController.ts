import type { NextFunction, Request, RequestHandler, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentParams, AppointmentOutcomeForm, IAppointmentFormPageController } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import ReferenceDataService from '../../services/referenceDataService'

export default class AppointmentDetailsController implements IAppointmentFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  showSingle(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = _req.params as unknown as AppointmentParams
      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: appointment.offender.crn,
      }

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentParams.projectCode,
      })

      const contactOutcome = appointment.contactOutcomeCode
        ? await this.referenceDataService.getContactOutcome(res.locals.user.username, appointment.contactOutcomeCode)
        : undefined

      const page = new CheckAppointmentDetailsPage()

      let form: AppointmentOutcomeForm
      let formId: string
      if (_req.query.form) {
        // A form might exist if user has navigated back to this page
        formId = _req.query.form.toString()
        form = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      } else {
        const { data, key } = await this.appointmentFormService.createForm(
          appointment,
          project,
          res.locals.user.username,
          _req.query as Record<string, string>,
        )
        form = data
        formId = key.id
      }

      res.render('appointments/update/appointmentDetails', {
        ...page.paths({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          date: appointment.date,
          formId,
          originalSearch: form.originalSearch,
          project,
          form,
        }),
        form: formId,
        heading: page.offenderHeading(appointment.offender),
        ...page.viewData({ appointment, project, contactOutcome, formId, form }),
      })
    }
  }

  showSession(): RequestHandler {
    return async (_req: Request, _res: Response, next: NextFunction) => next()
  }

  // Kept for compatibility while tests are moved to showSingle/showSession.
  show(): RequestHandler {
    return this.showSingle()
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const page = new CheckAppointmentDetailsPage()

      return res.redirect(page.next({ ...appointmentParams, form: {} as AppointmentOutcomeForm }))
    }
  }
}
