import type { Request, RequestHandler, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentParams, AppointmentOutcomeForm } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'

export default class AppointmentDetailsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
  ) {}

  show(): RequestHandler {
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

      const page = new CheckAppointmentDetailsPage(_req.query, project)

      let form: AppointmentOutcomeForm
      if (page.formId) {
        // A form might exist if user has navigated back to this page
        form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)
      } else {
        const { data, key } = await this.appointmentFormService.createForm(
          appointment,
          res.locals.user.username,
          _req.query as Record<string, string>,
        )
        form = data
        page.setFormId(key.id)
      }

      res.render('appointments/update/appointmentDetails', {
        ...page.viewData({ appointment, project, originalSearch: form.originalSearch }),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const page = new CheckAppointmentDetailsPage(_req.body)

      return res.redirect(page.next(appointmentParams.projectCode, appointmentParams.appointmentId))
    }
  }
}
