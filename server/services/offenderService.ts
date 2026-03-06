import { CaseDetailsSummaryDto } from '../@types/shared'
import { GetOffenderRequest } from '../@types/user-defined'
import OffenderClient from '../data/offenderClient'

export default class OffenderService {
  constructor(private readonly projectClient: OffenderClient) {}

  async getOffenderSummary(request: GetOffenderRequest): Promise<CaseDetailsSummaryDto> {
    return this.projectClient.getOffenderSummary(request)
  }
}
