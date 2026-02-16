import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { ContactOutcomesDto, ProjectTypesDto } from '../@types/shared'
import { createQueryString } from '../utils/utils'

export default class ReferenceDataClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('referenceDataClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  getProjectTypes(username: string): Promise<ProjectTypesDto> {
    const path = paths.referenceData.projectTypes.pattern
    return this.get({ path }, asSystem(username))
  }

  getContactOutcomes(username: string, group?: 'AVAILABLE_TO_ADMIN'): Promise<ContactOutcomesDto> {
    const path = paths.referenceData.contactOutcomes.pattern
    const query = createQueryString({ group })
    return this.get({ path, query }, asSystem(username))
  }
}
