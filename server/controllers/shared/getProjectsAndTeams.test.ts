import type { Response } from 'express'
import ProviderService from '../../services/providerService'
import ProjectService from '../../services/projectService'
import { GovUkSelectOption } from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import getTeams from './getTeams'
import getProjectsAndTeams from './getProjectsAndTeams'
import pagedModelProjectOutcomeSummaryFactory from '../../testutils/factories/pagedModelProjectOutcomeSummaryFactory'

jest.mock('./getTeams')

describe('getProjectsAndTeams', () => {
  const teamItems = [
    { value: '1', text: 'Team 1' },
    { value: '2', text: 'Team 2' },
  ]
  const getTeamsMock: jest.Mock = getTeams as unknown as jest.Mock<Promise<Array<GovUkSelectOption>>>

  beforeEach(() => {
    jest.resetAllMocks()
    getTeamsMock.mockResolvedValue(teamItems)
  })

  it('returns only team items when team code is not provided', async () => {
    const providerService = {} as ProviderService
    const projectService = { getProjects: jest.fn() } as unknown as ProjectService

    const response = {
      locals: {
        user: {
          username: 'username',
        },
      },
    } as Response

    const result = await getProjectsAndTeams({
      projectService,
      providerService,
      projectTypeGroup: 'GROUP',
      providerCode: 'P1',
      response,
    })

    expect(result).toEqual({ teamItems })
    expect(getTeamsMock).toHaveBeenCalledWith({
      providerService,
      providerCode: 'P1',
      response,
      teamCode: undefined,
    })
    expect(projectService.getProjects).not.toHaveBeenCalled()
  })

  it('returns team and project items when team code is provided', async () => {
    const providerService = {} as ProviderService
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    const projectService = {
      getProjects: jest.fn().mockResolvedValue(projects),
    } as unknown as ProjectService

    const response = {
      locals: {
        user: {
          username: 'username',
        },
      },
    } as Response

    const projectItems = [
      { value: 'A', text: 'Project A' },
      { value: 'B', text: 'Project B' },
    ]
    jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(projectItems)

    const result = await getProjectsAndTeams({
      projectService,
      providerService,
      projectTypeGroup: 'GROUP',
      providerCode: 'P1',
      teamCode: 'T1',
      projectCode: 'B',
      response,
    })

    const teamCode = 'T1'
    expect(projectService.getProjects).toHaveBeenCalledWith({
      projectTypeGroup: 'GROUP',
      username: 'username',
      providerCode: 'P1',
      teamCode,
    })
    expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
      projects.content,
      'projectName',
      'projectCode',
      'Choose project',
      'B',
    )
    expect(result).toEqual({ teamItems, projectItems, teamCode })
  })

  it('uses empty projects list when project response content is undefined', async () => {
    const providerService = {} as ProviderService
    const projectService = {
      getProjects: jest.fn().mockResolvedValue({ content: undefined }),
    } as unknown as ProjectService

    const response = {
      locals: {
        user: {
          username: 'username',
        },
      },
    } as Response

    const projectItems = [{ value: 'A', text: 'Project A' }]
    jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(projectItems)

    const teamCode = 'T1'
    const result = await getProjectsAndTeams({
      projectService,
      providerService,
      projectTypeGroup: 'GROUP',
      providerCode: 'P1',
      teamCode,
      response,
    })

    expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
      [],
      'projectName',
      'projectCode',
      'Choose project',
      undefined,
    )
    expect(result).toEqual({ teamItems, projectItems, teamCode })
  })
})
