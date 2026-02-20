import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import getTeams, { GetTeamsParams } from './getTeams'

describe('getTeams', () => {
  it('returns a list of team items', async () => {
    const teamResponse = {
      providers: [
        {
          name: 'team 1',
          code: '1234',
        },
        {
          name: 'team 2',
          code: '4321',
        },
      ],
    }

    const providerService = { getTeams: jest.fn(() => teamResponse) } as unknown as ProviderService

    const getTeamParams: GetTeamsParams = {
      providerCode: '1',
      teamCode: '1234',
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
    }

    const result = await getTeams(getTeamParams)

    expect(result).toEqual([
      {
        value: '1234',
        text: 'team 1',
        selected: true,
      },
      {
        value: '4321',
        text: 'team 2',
        selected: false,
      },
    ])
  })

  it('returns empty if provider code is empty', async () => {
    const providerService = { getTeams: jest.fn } as unknown as ProviderService

    const getTeamParams: GetTeamsParams = {
      teamCode: '1234',
      response: {
        locals: {
          user: {
            username: 'username',
          },
        },
      } as Response,
      providerService,
    }

    const result = await getTeams(getTeamParams)
    expect(result).toEqual([])
  })
})
