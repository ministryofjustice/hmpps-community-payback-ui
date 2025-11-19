import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import SessionClient from './sessionClient'
import config from '../config'
import { createQueryString } from '../utils/utils'
import { SessionDto } from '../@types/shared'
import locationFactory from '../testutils/factories/locationFactory'

describe('SessionClient', () => {
  let sessionClient: SessionClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    sessionClient = new SessionClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('find', () => {
    it('should make a GET request to the find sessions path using user token and return the response body', async () => {
      const projectCode = '1'
      const date = '2026-01-01'
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
            offender: {
              forename: 'John',
              surname: 'Smith',
              crn: 'CRN123',
              objectType: 'Full',
            },
          },
        ],
      }

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/projects/${projectCode}/sessions/${date}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, session)

      const response = await sessionClient.find({ username: 'some-username', projectCode, date })

      expect(response).toEqual(session)
    })
  })

  describe('getSessions', () => {
    it('should make a GET request to the sessions path using user token and return the response body', async () => {
      const startDate = '2026-01-01'
      const endDate = '2026-05-01'
      const providerCode = 'A1234'
      const teamCode = 'XRTC123'

      const queryString = createQueryString({ startDate, endDate })

      const sessions = {
        allocations: [
          {
            id: 1,
            projectName: 'Community Garden Maintenance',
            teamId: 4,
            startDate,
            endDate,
            projectCode: '123',
            allocated: 12,
            outcomes: 2,
            enforcements: 3,
          },
        ],
      }

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/providers/${providerCode}/teams/${teamCode}/sessions?${queryString}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, sessions)

      const response = await sessionClient.getSessions({
        username: 'some-username',
        providerCode: 'A1234',
        teamCode,
        startDate,
        endDate,
      })

      expect(response).toEqual(sessions)
    })
  })
})
