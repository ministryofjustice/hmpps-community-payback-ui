import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CourseCompletionClient from './courseCompletionClient'
import config from '../config'
import paths from '../paths/api'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import courseCompletionRecommendationFactory from '../testutils/factories/courseCompletionRecommendationFactory'
import courseCompletionResolutionFactory from '../testutils/factories/courseCompletionResolutionFactory'
import pagedModelCourseCompletionEventFactory from '../testutils/factories/pagedModelCourseCompletionEventFactory'
import { CourseCompletionResolutionStatus } from '../@types/user-defined'
import courseCompletionHistoryFactory from '../testutils/factories/courseCompletionHistoryFactory'

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
        pduId: '123',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        page: 0,
        size: 10,
        resolutionStatus: 'Unresolved' as CourseCompletionResolutionStatus,
      }

      const courseCompletionsPagedResponse = pagedModelCourseCompletionEventFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/providers/${params.providerCode}/course-completions`)
        .query({
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          pduId: params.pduId,
          page: params.page,
          size: params.size,
          resolutionStatus: params.resolutionStatus,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, courseCompletionsPagedResponse)

      const response = await courseCompletionClient.getCourseCompletions(params)

      expect(response).toEqual(courseCompletionsPagedResponse)
    })
  })

  describe('save', () => {
    it('should make a POST request to the course completion resolution path using user token', async () => {
      const courseCompletionData = courseCompletionResolutionFactory.build()
      const id = '1'

      nock(config.apis.communityPaybackApi.url)
        .post(paths.courseCompletions.save({ id }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      const response = await courseCompletionClient.save({ username: 'some-username', id }, courseCompletionData)

      expect(response).toBeTruthy()
    })
  })

  describe('getRecommendedSelection', () => {
    it('should make a GET request to the recommended selection path using user token and return the response body', async () => {
      const id = '1'
      const recommendedSelection = courseCompletionRecommendationFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(paths.courseCompletions.recommendedSelection({ id }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, recommendedSelection)

      const response = await courseCompletionClient.getRecommendedSelection({ username: 'some-username', id })

      expect(response).toEqual(recommendedSelection)
    })
  })

  describe('getHistory', () => {
    it('should make a GET request to the history path using user token and return the response body', async () => {
      const id = '1'
      const blockSize = 3
      const courseCompletionHistory = courseCompletionHistoryFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(paths.courseCompletions.history({ id }))
        .query({
          blockSize,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, courseCompletionHistory)

      const response = await courseCompletionClient.getHistory({ username: 'some-username', id, blockSize })

      expect(response).toEqual(courseCompletionHistory)
    })
  })
})
