import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'
import ReferenceDataService from '../../services/referenceDataService'
import { communityCampusPduFactory } from '../../testutils/factories/communityCampusPduFactory'
import getProvidersAndPdus from './getProvidersAndPdus'

describe('getProvidersAndTeams', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns a list of PDU items for single provider', async () => {
    const provider = providerSummaryFactory.build()

    const providerService = {
      getProviders: jest.fn(() => [provider]),
    } as unknown as ProviderService

    const pduForSameProvider = communityCampusPduFactory.build({ providerCode: provider.code })
    const pduForDifferentProvider = communityCampusPduFactory.build({ providerCode: 'N00' })

    const referenceDataService = {
      getCommunityCampusPdus: jest.fn(() => ({ pdus: [pduForSameProvider, pduForDifferentProvider] })),
    } as unknown as ReferenceDataService

    const expectedPduItems = [
      { value: '', text: 'Choose PDU', selected: true },
      { value: pduForSameProvider.id, text: pduForSameProvider.name, selected: false },
    ]

    const params = {
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
      referenceDataService,
    }

    const result = await getProvidersAndPdus(params)

    expect(result).toEqual({
      provider: { text: provider.name, value: provider.code },
      pduItems: expectedPduItems,
    })
  })

  it('returns a list of providers if multiple providers and no provider code', async () => {
    const providers = providerSummaryFactory.buildList(2)

    const providerService = {
      getProviders: jest.fn(() => providers),
    } as unknown as ProviderService

    const pduForProvider1 = communityCampusPduFactory.build({ providerCode: providers[0].code })
    const pduForProvider2 = communityCampusPduFactory.build({ providerCode: providers[1].code })

    const referenceDataService = {
      getCommunityCampusPdus: jest.fn(() => ({ pdus: [pduForProvider1, pduForProvider2] })),
    } as unknown as ReferenceDataService

    const params = {
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
      referenceDataService,
    }

    const expectedProviderItems = [
      { value: '', text: 'Choose region', selected: true },
      { value: providers[0].code, text: providers[0].name, selected: false },
      { value: providers[1].code, text: providers[1].name, selected: false },
    ]

    const expectedPduItems = [
      { value: '', text: 'Choose region', selected: true },
      { value: pduForProvider1.id, text: pduForProvider1.name, selected: false },
      { value: pduForProvider2.id, text: pduForProvider2.name, selected: false },
    ]

    const result = await getProvidersAndPdus(params)

    expect(result).toEqual({
      providerItems: expectedProviderItems,
      pduItems: expectedPduItems,
    })
  })

  it('returns a list of providers and PDUs if there are multiple providers and a provider code is given', async () => {
    const selectedProviderCode = 'N00'
    const provider1 = providerSummaryFactory.build({ code: selectedProviderCode })
    const provider2 = providerSummaryFactory.build()
    const providers = [provider1, provider2]

    const providerService = {
      getProviders: jest.fn(() => providers),
    } as unknown as ProviderService

    const pduForProvider1 = communityCampusPduFactory.build({ providerCode: provider1.code })
    const pduForProvider2 = communityCampusPduFactory.build({ providerCode: provider2.code })

    const referenceDataService = {
      getCommunityCampusPdus: jest.fn(() => ({ pdus: [pduForProvider1, pduForProvider2] })),
    } as unknown as ReferenceDataService

    const params = {
      providerCode: selectedProviderCode,
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
      referenceDataService,
    }

    const expectedProviderItems = [
      { value: '', text: 'Choose region', selected: false },
      { value: provider1.code, text: provider1.name, selected: true },
      { value: provider2.code, text: provider2.name, selected: false },
    ]

    const expectedPduItems = [
      { value: '', text: 'Choose PDU', selected: true },
      { value: pduForProvider1.id, text: pduForProvider1.name, selected: false },
    ]

    const result = await getProvidersAndPdus(params)

    expect(result).toEqual({
      provider: { value: selectedProviderCode },
      providerItems: expectedProviderItems,
      pduItems: expectedPduItems,
    })
  })

  it('returns a list of providers and PDUs if there are multiple providers, and provider code and PDU ID is given', async () => {
    const selectedProviderCode = 'N00'
    const selectedPduId = 'abcd'
    const provider1 = providerSummaryFactory.build({ code: selectedProviderCode })
    const provider2 = providerSummaryFactory.build()
    const providers = [provider1, provider2]

    const providerService = {
      getProviders: jest.fn(() => providers),
    } as unknown as ProviderService

    const pduForProvider1 = communityCampusPduFactory.build({ providerCode: provider1.code, id: selectedPduId })
    const pduForProvider2 = communityCampusPduFactory.build({ providerCode: provider2.code })

    const referenceDataService = {
      getCommunityCampusPdus: jest.fn(() => ({ pdus: [pduForProvider1, pduForProvider2] })),
    } as unknown as ReferenceDataService

    const params = {
      providerCode: selectedProviderCode,
      pduId: selectedPduId,
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
      referenceDataService,
    }

    const expectedProviderItems = [
      { value: '', text: 'Choose region', selected: false },
      { value: provider1.code, text: provider1.name, selected: true },
      { value: provider2.code, text: provider2.name, selected: false },
    ]

    const expectedPduItems = [
      { value: '', text: 'Choose PDU', selected: false },
      { value: pduForProvider1.id, text: pduForProvider1.name, selected: true },
    ]

    const result = await getProvidersAndPdus(params)

    expect(result).toEqual({
      provider: { value: selectedProviderCode },
      providerItems: expectedProviderItems,
      pduItems: expectedPduItems,
    })
  })
})
