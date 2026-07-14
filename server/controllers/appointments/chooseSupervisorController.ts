import ChooseSupervisorPage, {
  SupervisorPageBody,
  SupervisorPageContext,
} from '../../pages/appointments/chooseSupervisorPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ProjectService from '../../services/projectService'
import SessionService from '../../services/sessionService'
import BaseAppointmentController, {
  AppointmentStepViewDataParams,
  ContextDataParams,
} from './baseAppointmentController'

export default class ChooseSupervisorController extends BaseAppointmentController<ChooseSupervisorPage> {
  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    sessionService: SessionService,
  ) {
    super(new ChooseSupervisorPage(), appointmentService, appointmentFormService, sessionService)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/chooseSupervisor'
  }

  protected async getContextData({ req, res, form }: ContextDataParams): Promise<SupervisorPageContext> {
    const { username } = res.locals.user
    const projectCode = req.params.projectCode as string

    const project = await this.projectService.getProject({
      username,
      projectCode,
    })

    const teams = await this.providerService.getTeams(project.providerCode, username)

    const query = (req.method === 'GET' ? req.query : req.body) as SupervisorPageBody
    const teamCode = query.team?.toString() ?? form?.supervisingTeam?.code

    const supervisors = teamCode
      ? await this.providerService.getSupervisors({
          providerCode: project.providerCode,
          teamCode,
          username,
        })
      : []
    return { teams, supervisors }
  }

  protected async getStepViewData({
    req,
    appointmentOrSession,
    form,
    formId,
    contextData,
  }: AppointmentStepViewDataParams): Promise<object> {
    const { teams, supervisors } = contextData as SupervisorPageContext
    const query = (req.method === 'GET' ? req.query : req.body) as SupervisorPageBody

    const stepViewData = this.page.viewData(appointmentOrSession, teams, supervisors, form, formId, query)

    return {
      ...stepViewData,
      team: query.team?.toString() ?? form?.supervisingTeam?.code,
    }
  }
}
