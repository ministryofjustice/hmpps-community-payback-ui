import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

type GetProvidersParams = {
  providerCode: string
  teamCode?: string
  response: Response
  providerService: ProviderService
}

export default async ({ providerService, providerCode, response }: GetProvidersParams) => {
  const providers = await providerService.getProviders(response.locals.user.username)
  return GovUkSelectInput.getOptions(providers, 'name', 'code', 'Choose region', providerCode)
}
