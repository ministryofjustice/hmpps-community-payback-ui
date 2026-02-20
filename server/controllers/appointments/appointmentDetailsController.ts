import type { Request, RequestHandler, Response } from 'express'
import CheckProjectDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import { generateErrorSummary } from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'
import { AppointmentParams, AppointmentOutcomeForm } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'

export default class AppointmentDetailsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
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

      const supervisors = await this.providerService.getSupervisors({
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        username: res.locals.user.username,
      })

      const providers = await this.providerService.getProviders(res.locals.user.username)
      const provider = providers.find(_provider => _provider.code === appointment.providerCode)

      const page = new CheckProjectDetailsPage(_req.query, project)

      let form: AppointmentOutcomeForm
      if (page.formId) {
        // A form might exist if user has navigated back to this page
        form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)
      } else {
        const { data, key } = await this.appointmentFormService.createForm(appointment, res.locals.user.username)
        form = data
        page.setFormId(key.id)
      }

      res.render('appointments/update/projectDetails', {
        ...page.viewData(appointment, supervisors, form, project, provider),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      const supervisors = await this.providerService.getSupervisors({
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        username: res.locals.user.username,
      })

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentParams.projectCode,
      })

      const providers = await this.providerService.getProviders(res.locals.user.username)
      const provider = providers.find(p => p.code === appointment.providerCode)

      const page = new CheckProjectDetailsPage(_req.body, project)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      page.validate()

      if (page.hasErrors) {
        return res.render('appointments/update/projectDetails', {
          ...page.viewData(appointment, supervisors, form, project, provider),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
        })
      }

      const toSave = page.updateForm(form, supervisors)
      await this.appointmentFormService.saveForm(page.formId, res.locals.user.username, toSave)

      return res.redirect(page.next(appointmentParams.projectCode, appointmentParams.appointmentId))
    }
  }
}
