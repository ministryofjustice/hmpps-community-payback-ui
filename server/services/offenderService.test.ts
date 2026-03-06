import OffenderClient from '../data/offenderClient'
import OffenderService from './offenderService'
import unpaidWorkSummaryFactory from '../testutils/factories/unpaidWorkSummaryFactory'

jest.mock('../data/offenderClient')

describe('OffenderService', () => {
  const offenderClient = new OffenderClient(null) as jest.Mocked<OffenderClient>
  let offenderService: OffenderService

  beforeEach(() => {
    offenderService = new OffenderService(offenderClient)
  })

  describe('getOffenderSummary', () => {
    it('should call method on the client and return its result', async () => {
      const unpaidWorkDetails = unpaidWorkSummaryFactory.buildList(2)

      offenderClient.getOffenderSummary.mockResolvedValue({ unpaidWorkDetails })
      const result = await offenderService.getOffenderSummary({
        username: 'some-username',
        crn: '1',
      })

      expect(offenderClient.getOffenderSummary).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ unpaidWorkDetails })
    })
  })
})
