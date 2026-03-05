import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'

export type FormKey = { type: string; id: string }

export default class FormClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('formClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async find<T>({ type, id }: FormKey, username: string): Promise<T> {
    const path = paths.forms({ type, id })
    return (await this.get({ path }, asSystem(username))) as T
  }

  async save({ type, id }: FormKey, username: string, data: Record<string, unknown>): Promise<void> {
    const path = paths.forms({ type, id })
    return this.put({ path, data }, asSystem(username))
  }
}
