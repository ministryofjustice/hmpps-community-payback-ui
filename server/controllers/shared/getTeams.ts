import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

export type GetTeamsParams = {
  providerCode: string
  teamCode?: string
  response: Response
  providerService: ProviderService
}

export default async ({ providerService, providerCode, teamCode, response }: GetTeamsParams) => {
  const teams = await providerService.getTeams(providerCode, response.locals.user.username)

  return GovUkSelectInput.getOptions(teams.providers, 'name', 'code', 'Choose team', teamCode)
}
