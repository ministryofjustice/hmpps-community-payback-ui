import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ProviderService from '../services/providerService'
import getProvidersAndTeams, { ProvidersAndTeams } from './shared/getProvidersAndTeams'
import ProjectsController from './projectsController'
import ProjectService from '../services/projectService'
import AppointmentService from '../services/appointmentService'
import ProjectIndexPage from '../pages/projectIndexPage'
import pagedModelProjectOutcomeSummaryFactory from '../testutils/factories/pagedModelProjectOutcomeSummaryFactory'

jest.mock('./shared/getProvidersAndTeams')

describe('ProjectsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const response = createMock<Response>()

  let projectsController: ProjectsController
  const providerService = createMock<ProviderService>()
  const projectService = createMock<ProjectService>()
  const appointmentService = createMock<AppointmentService>()

  const providersAndTeams = {
    provider: { value: 'X', text: 'Provider' },
    teamItems: [
      { text: 'Team 1', value: '1' },
      { text: 'Team 2', value: '2' },
    ],
    providerItems: [
      { text: 'Provider 1', value: '1' },
      { text: 'Provider 2', value: '2' },
    ],
  }

  const getProvidersMock: jest.Mock = getProvidersAndTeams as unknown as jest.Mock<Promise<ProvidersAndTeams>>

  beforeEach(() => {
    jest.resetAllMocks()
    projectsController = new ProjectsController(providerService, projectService, appointmentService)
    getProvidersMock.mockResolvedValue(providersAndTeams)
  })
  describe('index', () => {
    it('renders the index page', async () => {
      request.query = { provider: 'x' }

      const requestHandler = projectsController.index()
      await requestHandler(request, response, next)

      expect(getProvidersAndTeams).toHaveBeenCalledWith({
        response,
        providerService,
        providerCode: 'x',
        teamCode: undefined,
      })

      expect(response.render).toHaveBeenCalledWith('projects/index', { form: providersAndTeams, backPath: '/' })
    })

    it.each(['', undefined, null])(
      'passes undefined to the getProvidersAndTeams handler if the input had no value',
      async (provider?: string | null) => {
        request.query = { provider }

        const requestHandler = projectsController.index()
        await requestHandler(request, response, next)

        expect(getProvidersAndTeams).toHaveBeenCalledWith({
          response,
          providerService,
          providerCode: undefined,
          teamCode: undefined,
        })

        expect(response.render).toHaveBeenCalledWith('projects/index', { form: providersAndTeams, backPath: '/' })
      },
    )
  })

  describe('filter', () => {
    it('renders the index page with search results', async () => {
      const providerCode = 'x'
      const teamCode = 'y'
      request.query = { provider: providerCode, team: teamCode }

      const requestHandler = projectsController.filter()

      const projects = pagedModelProjectOutcomeSummaryFactory.build()
      projectService.getIndividualPlacementProjects.mockResolvedValue(projects)

      const projectRows = [[{ text: 'some value' }, { text: 'some other value' }]]
      jest.spyOn(ProjectIndexPage, 'projectSummaryList').mockReturnValue(projectRows)

      await requestHandler(request, response, next)

      expect(getProvidersAndTeams).toHaveBeenCalledWith({
        response,
        providerService,
        providerCode,
        teamCode,
      })
      expect(response.render).toHaveBeenCalledWith('projects/index', {
        form: providersAndTeams,
        backPath: '/',
        projectRows,
        showNoResultsMessage: false,
      })
    })

    it('shows no results message if no results', async () => {
      const providerCode = 'x'
      const teamCode = 'y'
      request.query = { provider: providerCode, team: teamCode }

      const requestHandler = projectsController.filter()

      const projects = pagedModelProjectOutcomeSummaryFactory.build({ content: [] })
      projectService.getIndividualPlacementProjects.mockResolvedValue(projects)

      jest.spyOn(ProjectIndexPage, 'projectSummaryList').mockReturnValue([])

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('projects/index', {
        form: providersAndTeams,
        backPath: '/',
        projectRows: [],
        showNoResultsMessage: true,
      })
    })

    it.each([undefined, null])(
      'passes undefined to the getProvidersAndTeams handler if the inputs had no value',
      async (input?: string | null) => {
        request.query = { provider: input, team: input }

        const projects = pagedModelProjectOutcomeSummaryFactory.build({ content: [] })
        projectService.getIndividualPlacementProjects.mockResolvedValue(projects)

        jest.spyOn(ProjectIndexPage, 'projectSummaryList').mockReturnValue([])

        const requestHandler = projectsController.filter()
        await requestHandler(request, response, next)

        expect(getProvidersAndTeams).toHaveBeenCalledWith({
          response,
          providerService,
          providerCode: undefined,
          teamCode: undefined,
        })
      },
    )
  })
})
