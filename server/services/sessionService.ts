import { PagedModelSessionSummaryDto } from '../@types/shared'
import { GetSessionRequest, GetSessionsRequest, Session } from '../@types/user-defined'
import SessionClient from '../data/sessionClient'
import { uiPageNumber } from '../utils/paginationUtils'
import AppointmentService from './appointmentService'
import ProjectService from './projectService'

export default class SessionService {
  constructor(
    private readonly sessionClient: SessionClient,
    private readonly projectService: ProjectService,
    private readonly appointmentService: AppointmentService,
  ) {}

  async getSessions(request: GetSessionsRequest): Promise<PagedModelSessionSummaryDto> {
    const sessions = await this.sessionClient.getSessions(request)

    return {
      ...sessions,
      page: { ...sessions.page, number: uiPageNumber(sessions.page) },
    } as PagedModelSessionSummaryDto
  }

  async getSession(request: GetSessionRequest): Promise<Session> {
    const { username, projectCode, date } = request
    const project = await this.projectService.getProject({ username, projectCode })
    const appointments = await this.appointmentService.getAppointments(username, {
      projectCodes: [projectCode],
      fromDate: date,
      toDate: date,
    })

    return { ...project, appointmentSummaries: appointments.content, date } as Session
  }
}
