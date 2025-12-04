import { SessionSummariesDto, SessionDto } from '../@types/shared'
import SessionClient from '../data/sessionClient'
import SessionService from './sessionService'
import locationFactory from '../testutils/factories/locationFactory'

jest.mock('../data/sessionClient')

describe('ProviderService', () => {
  const sessionClient = new SessionClient(null) as jest.Mocked<SessionClient>
  let sessionService: SessionService

  beforeEach(() => {
    sessionService = new SessionService(sessionClient)
  })

  it('should call getSessions on the api client and return its result', async () => {
    const sessions: SessionSummariesDto = {
      allocations: [
        {
          date: '2025-09-07',
          projectName: 'project-name',
          projectCode: 'prj',
          startTime: '09:00',
          endTime: '17:00',
          numberOfOffendersAllocated: 5,
          numberOfOffendersWithOutcomes: 3,
          numberOfOffendersWithEA: 1,
        },
      ],
    }

    sessionClient.getSessions.mockResolvedValue(sessions)

    const result = await sessionService.getSessions({
      username: 'some-username',
      providerCode: 'A1234',
      teamCode: 'XRTC12',
      startDate: '2025-09-01',
      endDate: '2025-09-02',
    })

    expect(sessionClient.getSessions).toHaveBeenCalledTimes(1)
    expect(result).toEqual(sessions)
    expect(result.allocations[0]).toEqual(sessions.allocations[0])
  })

  it('should call find on the client and return its result', async () => {
    const location = locationFactory.build()
    const session: SessionDto = {
      projectName: 'Park cleaning',
      projectCode: 'XCT12',
      projectLocation: 'Hammersmith',
      location,
      date: '2025-01-02',
      startTime: '11:00',
      endTime: '12:00',
      appointmentSummaries: [
        {
          id: 1001,
          requirementMinutes: 600,
          completedMinutes: 500,
          adjustmentMinutes: -20,
          offender: {
            forename: 'John',
            surname: 'Smith',
            crn: 'CRN123',
            objectType: 'Full',
          },
        },
      ],
    }

    sessionClient.find.mockResolvedValue(session)
    const result = await sessionService.getSession({
      username: 'some-username',
      projectCode: '1',
      date: '2025-01-01',
    })

    expect(sessionClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(session)
    expect(result.appointmentSummaries[0]).toEqual(session.appointmentSummaries[0])
  })
})
