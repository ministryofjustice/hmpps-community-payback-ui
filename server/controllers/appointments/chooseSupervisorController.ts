import type { Request, RequestHandler, Response } from 'express'
import ChooseSupervisorPage, {
  AppointmentDetailsQuery,
  SupervisorPageBody,
} from '../../pages/appointments/chooseSupervisorPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
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

      const formId = _req.query.form?.toString()
      const page = new ChooseSupervisorPage()

      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)

      const team = _req.query.team?.toString() || form?.supervisingTeam?.code

      const supervisors = team
        ? await this.providerService.getSupervisors({
            providerCode: project.providerCode,
            teamCode: team,
            username: res.locals.user.username,
          })
        : []

      res.render('appointments/update/chooseSupervisor', {
        ...page.viewData(appointmentOrSession, teams, supervisors, form, _req.query as AppointmentDetailsQuery, formId),
        chooseSupervisorPath: page.updatePath(appointmentOrSession, formId),
        form: formId,
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
      const formId = _req.body.form?.toString()

      const supervisors = team
        ? await this.providerService.getSupervisors({
            providerCode: project.providerCode,
            teamCode: team,
            username: res.locals.user.username,
          })
        : []

      const page = new ChooseSupervisorPage()
      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)

      const { hasErrors, errors, errorSummary } = page.validationErrors(_req.body)

      if (hasErrors) {
        return res.render('appointments/update/chooseSupervisor', {
          ...page.viewData(
            appointmentOrSession,
            teams,
            supervisors,
            form,
            _req.body as AppointmentDetailsQuery,
            formId,
          ),
          errors,
          errorSummary,
          chooseSupervisorPath: page.updatePath(appointmentOrSession, formId),
          form: formId,
        })
      }

      const toSave = page.updateForm(form, teams, supervisors, _req.body as AppointmentDetailsQuery)
      await this.appointmentFormService.saveForm(formId, res.locals.user.username, toSave)

      return res.redirect(page.next({ ...appointmentOrSessionParams, formId }))
    }
  }
}
