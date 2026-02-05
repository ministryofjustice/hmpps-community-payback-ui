import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { ProjectDto } from '../@types/shared'
import { GetProjectRequest } from '../@types/user-defined'

export default class ProjectClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('projectClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async find({ username, projectCode }: GetProjectRequest): Promise<ProjectDto> {
    const path = paths.projects.singleProject({ projectCode })
    return (await this.get({ path }, asSystem(username))) as ProjectDto
  }
}
