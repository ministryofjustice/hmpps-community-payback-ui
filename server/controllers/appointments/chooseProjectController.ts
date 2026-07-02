import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ProjectService from '../../services/projectService'
import ProviderService from '../../services/providerService'
import SessionService from '../../services/sessionService'
import ChooseProjectPage from '../../pages/appointments/chooseProjectPage'
import getProjectsAndTeams, { ProjectsAndTeamsViewData } from '../shared/getProjectsAndTeams'
import BaseAppointmentController, {
  AppointmentStepViewDataParams,
  ContextDataParams,
} from './baseAppointmentController'

export default class ChooseProjectController extends BaseAppointmentController<ChooseProjectPage> {
  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    sessionService: SessionService,
  ) {
    super(new ChooseProjectPage(), appointmentService, appointmentFormService, sessionService)
  }

  protected getStepViewData({ contextData }: AppointmentStepViewDataParams): Promise<ProjectsAndTeamsViewData> {
    return Promise.resolve(contextData as ProjectsAndTeamsViewData)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/chooseProject'
  }

  protected async getContextData({ req, res, form }: ContextDataParams): Promise<ProjectsAndTeamsViewData> {
    const project = await this.projectService.getProject({
      username: res.locals.user.username,
      projectCode: req.params.projectCode,
    })

    const teamCode = req.method === 'GET' ? (req.query.team ?? form.projectTeam?.code) : req.body.team
    const projectCode = (req.body?.project ?? form.project?.code)?.toString()

    return getProjectsAndTeams({
      projectService: this.projectService,
      providerService: this.providerService,
      projectTypeGroup: project.projectType.group,
      providerCode: project.providerCode,
      teamCode,
      projectCode,
      response: res,
      project,
    })
  }
}
