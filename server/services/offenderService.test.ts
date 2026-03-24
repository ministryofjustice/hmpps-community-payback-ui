import OffenderClient from '../data/offenderClient'
import OffenderService from './offenderService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'

jest.mock('../data/offenderClient')

describe('OffenderService', () => {
  const offenderClient = new OffenderClient(null) as jest.Mocked<OffenderClient>
  let offenderService: OffenderService

  beforeEach(() => {
    jest.resetAllMocks()
    offenderService = new OffenderService(offenderClient)
  })

  describe('getOffenderSummary', () => {
    it('should call getOffenderSummary on the client and return its result', async () => {
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      offenderClient.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      const result = await offenderService.getOffenderSummary({
        username: 'some-username',
        crn: 'X000000',
      })

      expect(offenderClient.getOffenderSummary).toHaveBeenCalledTimes(1)
      expect(result).toEqual(caseDetailsSummary)
    })
  })
})
