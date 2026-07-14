import type { Request, RequestHandler, Response } from 'express'

import { AppointmentOrSessionParams, IFormPageController } from '../../@types/user-defined'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ProjectService from '../../services/projectService'
import ProviderService from '../../services/providerService'
import SessionService from '../../services/sessionService'
import ChooseProjectPage from '../../pages/appointments/chooseProjectPage'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import getProjectsAndTeams from '../shared/getProjectsAndTeams'

export default class ChooseProjectController implements IFormPageController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointmentOrSessionParams = req.params as unknown as AppointmentOrSessionParams
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

      const page = new ChooseProjectPage(req.query)

      const formId = req.query.form?.toString()
      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)

      const teamCode = (req.query?.team ?? form.projectTeam?.code)?.toString()
      const projectCode = form.project.code

      const items = await getProjectsAndTeams({
        projectService: this.projectService,
        providerService: this.providerService,
        projectTypeGroup: project.projectType.group,
        providerCode: project.providerCode,
        teamCode,
        projectCode,
        response: res,
        project,
      })

      res.render('appointments/update/chooseProject', {
        ...page.commonViewData({ appointmentOrSession, form, formId }),
        ...items,
      })
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointmentOrSessionParams = { ...req.params } as unknown as AppointmentOrSessionParams

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

      const teamCode = req.body?.team?.toString()
      const projectCode = req.body?.project?.toString()

      const page = new ChooseProjectPage(req.body)
      const formId = req.body.form?.toString()
      const form = await this.appointmentFormService.getForm(formId, res.locals.user.username)

      const items = await getProjectsAndTeams({
        projectService: this.projectService,
        providerService: this.providerService,
        projectTypeGroup: project.projectType.group,
        providerCode: project.providerCode,
        teamCode,
        projectCode,
        project,
        response: res,
      })

      const { hasErrors, errorSummary, errors } = page.getValidationErrors()

      if (hasErrors) {
        return res.render('appointments/update/chooseProject', {
          ...page.commonViewData({ appointmentOrSession, form, formId }),
          ...items,
          errors,
          errorSummary,
        })
      }

      const toSave = page.updateForm(form, items.teamItems, items.projectItems)
      await this.appointmentFormService.saveForm(formId, res.locals.user.username, toSave)

      return res.redirect(page.next({ ...appointmentOrSessionParams, formId, form: toSave }))
    }
  }
}
