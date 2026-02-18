import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { EteCourseCompletionEventDto, PagedModelEteCourseCompletionEventDto } from '../@types/shared'
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
    const { username, dateFrom, dateTo, page, size, sort } = params
    const query = createQueryString({ dateFrom, dateTo, page, size, sort })
    const path = paths.courseCompletions.filter({ providerCode: params.providerCode })

    return (await this.get({ path, query }, asSystem(username))) as PagedModelEteCourseCompletionEventDto
  }
}
