import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import { GovUkSelectOption } from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

export type GetTeamsParams = {
  providerCode?: string
  teamCode?: string
  response: Response
  providerService: ProviderService
}

export type ProvidersAndTeams = {
  provider?: { text?: string; value: string }
  providerItems?: Array<GovUkSelectOption>
  teamItems: Array<GovUkSelectOption>
}

export const getTeams = async ({
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

export const getProvidersAndTeams = async ({
  providerService,
  providerCode,
  teamCode,
  response,
}: GetTeamsParams): Promise<ProvidersAndTeams> => {
  const providers = await providerService.getProviders(response.locals.user.username)

  if (providers.length === 1) {
    const [dto] = providers

    const provider = { text: dto.name, value: dto.code }
    const teamItems = await getTeams({
      providerService,
      providerCode: provider.value,
      teamCode,
      response,
    })

    return { teamItems, provider }
  }

  const providerItems = GovUkSelectInput.getOptions(providers, 'name', 'code', 'Choose region', providerCode)

  const teamItems = await getTeams({
    providerService,
    providerCode,
    response,
    teamCode,
  })

  return { teamItems, provider: { value: providerCode }, providerItems }
}
