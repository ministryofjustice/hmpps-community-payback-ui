import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { EteCourseCompletionEventDto } from '../@types/shared'
import { GetCourseCompletionRequest } from '../@types/user-defined'

export default class CourseCompletionClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('courseCompletionClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async find({ username, id }: GetCourseCompletionRequest): Promise<EteCourseCompletionEventDto> {
    const path = paths.courseCompletions.singleCourseCompletion({ id })
    return (await this.get({ path }, asSystem(username))) as EteCourseCompletionEventDto
  }
}
