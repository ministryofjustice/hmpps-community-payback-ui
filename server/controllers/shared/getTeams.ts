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
    return []
  }

  const teams = await providerService.getTeams(providerCode, response.locals.user.username)

  const teamItems = teams.providers.map(team => {
    const selected = teamCode ? team.code === teamCode : undefined

    return {
      value: team.code,
      text: team.name,
      selected,
    }
  })

  return teamItems
}
