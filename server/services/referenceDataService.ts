import { ContactOutcomesDto, EnforcementActionDto, ProjectTypesDto } from '../@types/shared'
import ReferenceDataClient from '../data/referenceDataClient'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClient: ReferenceDataClient) {}

  async getProjectTypes(userName: string): Promise<ProjectTypesDto> {
    return this.referenceDataClient.getProjectTypes(userName)
  }

  async getEnforcementActions(userName: string): Promise<EnforcementActionDto[]> {
    const result = await this.referenceDataClient.getEnforcementActions(userName)
    return result.enforcementActions
  }

  async getContactOutcomes(userName: string): Promise<ContactOutcomesDto> {
    return this.referenceDataClient.getContactOutcomes(userName)
  }
}
