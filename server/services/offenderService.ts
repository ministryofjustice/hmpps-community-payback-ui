import { CaseDetailsSummaryDto, CreateAdjustmentDto } from '../@types/shared'
import OffenderClient, { OffenderRequirementRequest } from '../data/offenderClient'
import ReferenceDataService from './referenceDataService'

export default class OffenderService {
  constructor(
    private readonly offenderClient: OffenderClient,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  async getOffenderSummary({ username, crn }: { username: string; crn: string }): Promise<CaseDetailsSummaryDto> {
    return this.offenderClient.getOffenderSummary({ username, crn })
  }

  async adjustTravelTime(
    details: OffenderRequirementRequest,
    adjustment: Pick<CreateAdjustmentDto, 'taskId' | 'minutes'>,
  ) {
    const adjustmentReasonId = await this.referenceDataService.getTravelAdjustmentReasonId(details.username)
    const dateOfAdjustment = new Date().toISOString()

    const data: CreateAdjustmentDto = {
      ...adjustment,
      // Will result in a reduction of minutes required
      type: 'Negative',
      adjustmentReasonId,
      dateOfAdjustment,
    }

    return this.offenderClient.saveAdjustment(details, data)
  }
}
