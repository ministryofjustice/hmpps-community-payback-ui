import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import getProviders from './getProviders'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

describe('getProviders', () => {
  it('returns a list of provider items', async () => {
    const providerResponse = {
      providers: [
        {
          name: 'provider 1',
          code: '1234',
        },
        {
          name: 'provider 2',
          code: '4321',
        },
      ],
    }

    const providerService = { getProviders: jest.fn(() => providerResponse) } as unknown as ProviderService

    const getProvidersParams = {
      providerCode: '1',
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
    }

    const providerItems = [
      { text: 'Provider 1', value: '1' },
      { text: 'Provider 2', value: '2' },
    ]

    jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(providerItems)

    const result = await getProviders(getProvidersParams)

    expect(result).toEqual(providerItems)
  })
})
