import type { Request, RequestHandler, Response } from 'express'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import { generateErrorSummary } from '../../utils/errorUtils'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentOrSessionParams, IFormPageController } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import SessionService from '../../services/sessionService'

export default class ChooseSupervisorController implements IFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
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

      const teams = await this.providerService.getTeams(project.providerCode, res.locals.user.username)

      const page = new ChooseSupervisorPage(_req.query)

      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      const team = _req.query.team?.toString() || form?.team?.code

      const supervisors = team
        ? await this.providerService.getSupervisors({
            providerCode: project.providerCode,
            teamCode: team,
            username: res.locals.user.username,
          })
        : []

      res.render('appointments/update/chooseSupervisor', {
        ...page.viewData(appointmentOrSession, teams, supervisors, form),
        chooseSupervisorPath: page.updatePath(appointmentOrSession),
        form: page.formId,
        team,
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentOrSessionParams = { ..._req.params } as unknown as AppointmentOrSessionParams

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

      const teams = await this.providerService.getTeams(project.providerCode, res.locals.user.username)

      const team = _req.body.team?.toString()

      const supervisors = team
        ? await this.providerService.getSupervisors({
            providerCode: project.providerCode,
            teamCode: team,
            username: res.locals.user.username,
          })
        : []

      const page = new ChooseSupervisorPage(_req.body)
      const form = await this.appointmentFormService.getForm(page.formId, res.locals.user.username)

      page.validate()

      if (page.hasErrors) {
        return res.render('appointments/update/chooseSupervisor', {
          ...page.viewData(appointmentOrSession, teams, supervisors, form),
          errors: page.validationErrors,
          errorSummary: generateErrorSummary(page.validationErrors),
          chooseSupervisorPath: page.updatePath(appointmentOrSession),
          form: page.formId,
        })
      }

      const toSave = page.updateForm(form, teams, supervisors)
      await this.appointmentFormService.saveForm(page.formId, res.locals.user.username, toSave)

      return res.redirect(page.next(appointmentOrSessionParams))
    }
  }
}
