import { SessionDto, SessionSummariesDto } from '../@types/shared'
import { GetSessionRequest, GetSessionsParams } from '../@types/user-defined'
import SessionClient from '../data/sessionClient'
import { apiPageNumber, uiPageNumber } from '../utils/paginationUtils'

export default class SessionService {
  constructor(private readonly sessionClient: SessionClient) {}

  async getSessions(request: GetSessionsParams): Promise<SessionSummariesDto> {
    const { page, sortBy, sortDirection, size, ...params } = request
    const sort = [`${sortBy ?? 'date'},${sortDirection ?? 'asc'}`]

    const sessions = await this.sessionClient.getSessions({
      ...params,
      sort,
      page: apiPageNumber(page),
      size: size ?? 20,
    })

    return {
      ...sessions,
      page: { ...sessions.page, number: uiPageNumber(sessions.page) },
    } as SessionSummariesDto
  }

  async getSession(request: GetSessionRequest): Promise<SessionDto> {
    const appointments = await this.sessionClient.find(request)
    return appointments
  }
}
