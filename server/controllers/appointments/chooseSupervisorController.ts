import type { Request, RequestHandler, Response } from 'express'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import { generateErrorSummary } from '../../utils/errorUtils'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentParams } from '../../@types/user-defined'
import paths from '../../paths'

export default class ChooseSupervisorController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = _req.params as unknown as AppointmentParams
      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      const teams = await this.providerService.getTeams(appointment.providerCode, res.locals.user.username)

      const team = _req.query.team?.toString()

      const supervisors = team
        ? await this.providerService.getSupervisors({
            providerCode: appointment.providerCode,
            teamCode: team,
            username: res.locals.user.username,
          })
        : []

      const page = new ChooseSupervisorPage(_req.query, appointment)

      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      res.render('appointments/update/chooseSupervisor', {
        ...page.viewData(appointment, teams, supervisors, form),
        chooseSupervisorPath: paths.appointments.chooseSupervisor(appointmentParams),
        form: page.formId,
        team,
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

      const teams = await this.providerService.getTeams(appointment.providerCode, res.locals.user.username)

      const team = _req.body.team?.toString()

      const supervisors = team
        ? await this.providerService.getSupervisors({
            providerCode: appointment.providerCode,
            teamCode: team,
            username: res.locals.user.username,
          })
        : []

      const page = new ChooseSupervisorPage(_req.body, appointment)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      page.validate()

      if (page.hasErrors) {
        return res.render('appointments/update/chooseSupervisor', {
          ...page.viewData(appointment, teams, supervisors, form),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
          chooseSupervisorPath: paths.appointments.chooseSupervisor(appointmentParams),
          form: page.formId,
        })
      }

      const toSave = page.updateForm(form, supervisors)
      await this.appointmentFormService.saveForm(page.formId, res.locals.user.username, toSave)

      return res.redirect(page.next(appointmentParams.projectCode, appointmentParams.appointmentId))
    }
  }
}
