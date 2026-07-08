import type { Request, RequestHandler, Response } from 'express'

import AppointmentFormService, { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import BulkUpdatePage from '../../pages/appointments/bulkUpdatePage'
import SessionService from '../../services/sessionService'
import AppointmentService from '../../services/appointmentService'
import ProjectService from '../../services/projectService'
import { IFormPageController } from '../../@types/user-defined'

export default class BulkUpdateController implements IFormPageController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly page: BulkUpdatePage,
    private readonly appointmentService: AppointmentService,
    private readonly projectService: ProjectService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, date } = req.params

      const request = {
        username: res.locals.user.username,
        projectCode,
        date,
      }

      let formId = req.query.form?.toString()

      const project = await this.projectService.getProject(request)

      const session = await this.sessionService.getSession(request)

      let formData: AppointmentOutcomeForm
      if (formId) {
        // A form might exist if user has navigated back to this page
        formData = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      } else {
        const { data, key } = await this.appointmentFormService.createBulkForm(
          project,
          date,
          res.locals.user.username,
          req.query as Record<string, string>,
        )
        formData = data
        formId = key.id
      }

      res.render('appointments/update/bulk', this.page.viewData({ formData, session, formId }))
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, date } = req.params
      const formId = req.query.form?.toString()

      const formData = await this.appointmentFormService.getForm(formId, res.locals.user.username)

      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      if (hasErrors) {
        const request = {
          username: res.locals.user.username,
          projectCode,
          date,
        }
        const session = await this.sessionService.getSession(request)
        return res.render('appointments/update/bulk', {
          ...this.page.viewData({ formData, session, formId }),
          errorSummary,
          errors,
        })
      }

      const selectedAppointmentIds = this.page.selectedAppointments(req.body)
      const selectedAppointments = await Promise.all(
        selectedAppointmentIds.map(appointmentId =>
          this.appointmentService.getAppointment({
            username: res.locals.user.username,
            projectCode,
            appointmentId,
          }),
        ),
      )

      const updatedFormData = this.page.getFormData(formData, selectedAppointments)
      await this.appointmentFormService.saveForm(formId, res.locals.user.username, updatedFormData)

      return res.redirect(this.page.next(formId, projectCode, date))
    }
  }
}
