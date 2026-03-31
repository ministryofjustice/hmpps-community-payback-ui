import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import {
  CourseCompletionResolutionDto,
  EteCourseCompletionEventDto,
  PagedModelEteCourseCompletionEventDto,
} from '../@types/shared'
import { GetCourseCompletionRequest, GetCourseCompletionsRequest } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'

export default class CourseCompletionClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('courseCompletionClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async find({ username, id }: GetCourseCompletionRequest): Promise<EteCourseCompletionEventDto> {
    const path = paths.courseCompletions.singleCourseCompletion({ id })
    return (await this.get({ path }, asSystem(username))) as EteCourseCompletionEventDto
  }

  async getCourseCompletions(params: GetCourseCompletionsRequest): Promise<PagedModelEteCourseCompletionEventDto> {
    const { username, providerCode, ...queryParams } = params
    const query = createQueryString(queryParams)
    const path = paths.courseCompletions.filter({ providerCode })

    return (await this.get({ path, query }, asSystem(username))) as PagedModelEteCourseCompletionEventDto
  }

  async save({ username, id }: GetCourseCompletionRequest, data: CourseCompletionResolutionDto): Promise<void> {
    const path = paths.courseCompletions.save({ id })
    return this.post({ path, data }, asSystem(username))
  }
}
