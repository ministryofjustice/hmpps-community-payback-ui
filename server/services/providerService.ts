import { ProviderTeamSummariesDto, SupervisorSummaryDto } from '../@types/shared'
import { GetForTeamRequest } from '../@types/user-defined'
import ProviderClient from '../data/providerClient'

export default class ProviderService {
  constructor(private readonly providerClient: ProviderClient) {}

  async getTeams(providerCode: string, username: string): Promise<ProviderTeamSummariesDto> {
    const teams = await this.providerClient.getTeams(providerCode, username)

    return teams
  }

  async getSupervisors(request: GetForTeamRequest): Promise<SupervisorSummaryDto[]> {
    const response = await this.providerClient.getSupervisors(request)
    return response.supervisors
  }
}
