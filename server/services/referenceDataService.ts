import { AdjustmentReasonDto, CommunityCampusPdusDto, ContactOutcomesDto, ProjectTypesDto } from '../@types/shared'
import ReferenceDataClient from '../data/referenceDataClient'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClient: ReferenceDataClient) {}

  async getProjectTypes(userName: string): Promise<ProjectTypesDto> {
    return this.referenceDataClient.getProjectTypes(userName)
  }

  async getAvailableContactOutcomes(userName: string): Promise<ContactOutcomesDto> {
    return this.referenceDataClient.getContactOutcomes(userName, 'AVAILABLE_TO_ADMIN')
  }

  async getCommunityCampusPdus(userName: string): Promise<CommunityCampusPdusDto> {
    return this.referenceDataClient.getCommunityCampusPdus(userName)
  }

  async getAdjustmentReasons(userName: string): Promise<Array<AdjustmentReasonDto>> {
    const response = await this.referenceDataClient.getAdjustmentReasons(userName)
    return response.adjustmentReasons
  }

  async getTravelAdjustmentReasonId(userName: string): Promise<string> {
    const reasons = await this.getAdjustmentReasons(userName)
    const travelReason = reasons.find(reason => reason.deliusCode === 'TTX')

    if (!travelReason) {
      throw new Error('Adjustment reason with code TTX not found.')
    }

    return travelReason.id
  }

  static readonly attendedCompliedOutcome = 'ATTC'
}
