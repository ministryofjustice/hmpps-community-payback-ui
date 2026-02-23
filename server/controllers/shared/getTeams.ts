import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import { GovUkSelectOption } from '../../@types/user-defined'

export type GetTeamsParams = {
  providerCode?: string
  teamCode?: string
  response: Response
  providerService: ProviderService
}

export default async ({
  providerService,
  providerCode,
  teamCode,
  response,
}: GetTeamsParams): Promise<Array<GovUkSelectOption>> => {
  if (!providerCode) {
    return [
      {
        value: '',
        text: 'Choose a region',
      },
    ]
  }

  const teams = await providerService.getTeams(providerCode, response.locals.user.username)

  return GovUkSelectInput.getOptions(teams.providers, 'name', 'code', 'Choose team', teamCode)
}
