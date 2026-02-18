import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CourseCompletionClient from './courseCompletionClient'
import config from '../config'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import pagedModelCourseCompletionEventFactory from '../testutils/factories/pagedModelCourseCompletionEventFactory'

describe('CourseCompletionClient', () => {
  let courseCompletionClient: CourseCompletionClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    courseCompletionClient = new CourseCompletionClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('find', () => {
    it('should make a GET request to the course completion show path using user token and return the response body', async () => {
      const id = '1'

      const courseCompletion = courseCompletionFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/course-completions/${id}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, courseCompletion)

      const response = await courseCompletionClient.find({ username: 'some-username', id })

      expect(response).toEqual(courseCompletion)
    })
  })

  describe('getCourseCompletions', () => {
    it('should make a GET request to the course completions filter path using user token and return the response body', async () => {
      const params = {
        username: 'some-username',
        providerCode: 'XR2',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        page: 0,
        size: 10,
      }

      const courseCompletionsPagedResponse = pagedModelCourseCompletionEventFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/providers/${params.providerCode}/course-completions`)
        .query({
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          page: params.page,
          size: params.size,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, courseCompletionsPagedResponse)

      const response = await courseCompletionClient.getCourseCompletions(params)

      expect(response).toEqual(courseCompletionsPagedResponse)
    })
  })
})
