import { ContactOutcomesDto, ProjectTypesDto } from '../@types/shared'
import ReferenceDataClient from '../data/referenceDataClient'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClient: ReferenceDataClient) {}

  async getProjectTypes(userName: string): Promise<ProjectTypesDto> {
    return this.referenceDataClient.getProjectTypes(userName)
  }

  async getAvailableContactOutcomes(userName: string): Promise<ContactOutcomesDto> {
    return this.referenceDataClient.getContactOutcomes(userName, 'AVAILABLE_TO_ADMIN')
  }
}
