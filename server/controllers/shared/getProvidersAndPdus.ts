import GovUkSelectInput from '../../forms/GovUkSelectInput'
import { GetProvidersAndPdusParams, GovUkSelectOption } from '../../@types/user-defined'

export type ProvidersAndPdus = {
  provider?: { text?: string; value: string }
  providerItems?: Array<GovUkSelectOption>
  pduItems: Array<GovUkSelectOption>
}

export default async ({
  providerService,
  referenceDataService,
  providerCode,
  pduId,
  response,
}: GetProvidersAndPdusParams): Promise<ProvidersAndPdus> => {
  const providers = await providerService.getProviders(response.locals.user.username)
  const pdus = await referenceDataService.getCommunityCampusPdus(response.locals.user.username)

  const defaultProviderOptionText = 'Choose region'
  let defaultPduOptionText = 'Select a PDU'

  if (providers.length === 1) {
    const [dto] = providers

    const provider = { text: dto.name, value: dto.code }
    const providerPdus = pdus.pdus.filter(pdu => pdu.providerCode === provider.value)
    const pduItems = GovUkSelectInput.getOptions(providerPdus, 'name', 'id', defaultPduOptionText, pduId)

    return { pduItems, provider }
  }

  const provider = providerCode ? { value: providerCode } : undefined
  const providerItems = GovUkSelectInput.getOptions(providers, 'name', 'code', defaultProviderOptionText, providerCode)

  if (!provider) {
    defaultPduOptionText = defaultProviderOptionText
  }

  const pduItems = GovUkSelectInput.getOptions(pdus.pdus, 'name', 'id', defaultPduOptionText, pduId)

  return { pduItems, provider, providerItems }
}
