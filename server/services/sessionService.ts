import { SessionDto, SessionSummariesDto } from '../@types/shared'
import { GetSessionRequest, GetSessionsRequest } from '../@types/user-defined'
import SessionClient from '../data/sessionClient'

export default class SessionService {
  constructor(private readonly sessionClient: SessionClient) {}

  async getSessions({ username, teamCode, startDate, endDate }: GetSessionsRequest): Promise<SessionSummariesDto> {
    const sessions = await this.sessionClient.getSessions({ username, teamCode, startDate, endDate })

    return sessions
  }

  async getSession(request: GetSessionRequest): Promise<SessionDto> {
    const appointments = await this.sessionClient.find(request)
    return appointments
  }
}
