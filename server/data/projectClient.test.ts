import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import ProjectClient from './projectClient'
import config from '../config'
import projectFactory from '../testutils/factories/projectFactory'
import { GetProjectsRequest } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'
import pagedModelProjectSummaryFactory from '../testutils/factories/pagedModelProjectSummaryFactory'

describe('ProjectClient', () => {
  let projectClient: ProjectClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    projectClient = new ProjectClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('find', () => {
    it('should make a GET request to the find projects path using user token and return the response body', async () => {
      const projectCode = '1'

      const project = projectFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/projects/${projectCode}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, project)

      const response = await projectClient.find({ username: 'some-username', projectCode })

      expect(response).toEqual(project)
    })
  })

  describe('getProjects', () => {
    it('should make a GET request to the projects path using user token and return the response body', async () => {
      const projectTypeGroup: GetProjectsRequest['projectTypeGroup'] = 'INDIVIDUAL'
      const providerCode = 'A1234'
      const teamCode = 'XRTC123'

      const queryString = createQueryString({ projectTypeGroup })

      const projects = pagedModelProjectSummaryFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(`/admin/providers/${providerCode}/teams/${teamCode}/projects?${queryString}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, projects)

      const response = await projectClient.getProjects({
        username: 'some-username',
        providerCode: 'A1234',
        teamCode,
        projectTypeGroup,
      })

      expect(response).toEqual(projects)
    })
  })
})
