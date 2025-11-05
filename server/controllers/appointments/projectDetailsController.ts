import type { Request, RequestHandler, Response } from 'express'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import generateErrorSummary from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'
import { AppointmentOutcomeForm } from '../../@types/user-defined'

export default class ProjectDetailsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const supervisors = await this.providerService.getSupervisors({
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        username: res.locals.user.username,
      })

      const page = new CheckProjectDetailsPage(_req.query)

      res.render('appointments/update/projectDetails', {
        ...page.viewData(appointment, supervisors),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const supervisors = await this.providerService.getSupervisors({
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        username: res.locals.user.username,
      })

      const page = new CheckProjectDetailsPage(_req.body)
      page.validate()

      if (page.hasErrors) {
        return res.render('appointments/update/projectDetails', {
          ...page.viewData(appointment, supervisors),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      let form: AppointmentOutcomeForm
      if (page.formId) {
        // A form might exist if user has navigated back to this page
        form = await this.appointmentFormService.getForm(page.formId, res.locals.user.name)
      } else {
        const { data, key } = this.appointmentFormService.createForm()
        form = data
        page.setFormId(key.id)
      }

      const toSave = page.updateForm(form, supervisors)
      await this.appointmentFormService.saveForm(page.formId, res.locals.user.name, toSave)

      return res.redirect(page.next(appointmentId))
    }
  }
}
