import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { PagedModelProjectOutcomeSummaryDto, ProjectDto } from '../@types/shared'
import { GetProjectRequest, GetProjectsRequest } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'

export default class ProjectClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('projectClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getProjects({
    username,
    providerCode,
    teamCode,
    projectTypeGroup,
  }: GetProjectsRequest): Promise<PagedModelProjectOutcomeSummaryDto> {
    const path = paths.projects.filter({ providerCode, teamCode })
    const query = createQueryString({ projectTypeGroup })

    return (await this.get({ path, query }, asSystem(username))) as PagedModelProjectOutcomeSummaryDto
  }

  async find({ username, projectCode }: GetProjectRequest): Promise<ProjectDto> {
    const path = paths.projects.singleProject({ projectCode })
    return (await this.get({ path }, asSystem(username))) as ProjectDto
  }
}
