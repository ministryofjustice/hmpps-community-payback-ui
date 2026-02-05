import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { SessionDto, SessionSummariesDto } from '../@types/shared'
import SessionUtils from '../utils/sessionUtils'
import DateTimeFormats from '../utils/dateTimeUtils'
import locationFactory from '../testutils/factories/locationFactory'
import providerTeamSummaryFactory from '../testutils/factories/providerTeamSummaryFactory'
import TrackProgressPage from '../pages/trackProgressPage'
import { GovUkFrontendDateInputItem } from '../forms/GovukFrontendDateInput'
import LocationUtils from '../utils/locationUtils'

jest.mock('../pages/trackProgressPage')

describe('SessionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let sessionsController: SessionsController
  const providerService = createMock<ProviderService>()
  const sessionService = createMock<SessionService>()
  const pageMock: jest.Mock = TrackProgressPage as unknown as jest.Mock<TrackProgressPage>

  beforeEach(() => {
    jest.resetAllMocks()
    sessionsController = new SessionsController(providerService, sessionService)
    pageMock.mockImplementation(() => {
      return {
        validationErrors: () => ({}),
        items: () => ({
          startDateItems: [] as GovUkFrontendDateInputItem[],
          endDateItems: [] as GovUkFrontendDateInputItem[],
        }),
        searchValues: () => ({
          startDate: '2025-12-27',
          endDate: '2025-12-27',
        }),
        teamCode: 'XR2',
      }
    })
  })

  describe('index', () => {
    it('should render the dashboard page', async () => {
      const teams = {
        providers: [
          {
            id: 1001,
            code: 'XRT134',
            name: 'Team Lincoln',
          },
        ],
      }

      const response = createMock<Response>()
      providerService.getTeams.mockResolvedValue(teams)

      const requestHandler = sessionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [{ value: 'XRT134', text: 'Team Lincoln' }],
      })
    })
  })

  describe('search', () => {
    const resultTableRowsSpy = jest.spyOn(SessionUtils, 'sessionResultTableRows')

    beforeEach(() => {
      resultTableRowsSpy.mockReturnValue([])
    })

    it('should render the track progress page with errors', async () => {
      const errors = {
        someError: { text: 'error message' },
      }
      pageMock.mockImplementation(() => ({
        validationErrors: () => errors,
        items: () => ({
          startDateItems: [] as GovUkFrontendDateInputItem[],
          endDateItems: [] as GovUkFrontendDateInputItem[],
        }),
      }))
      const requestHandler = sessionsController.search()

      const firstTeam = { id: 1, code: 'XR123', name: 'Team Lincoln' }
      const secondTeam = { id: 2, code: 'XR124', name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          team: 'XR123',
        },
      })

      const response = createMock<Response>()
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'sessions/index',
        expect.objectContaining({
          errors,
          errorSummary: [
            {
              text: errors.someError.text,
              href: '#someError',
            },
          ],
        }),
      )
    })

    it('should render the dashboard page with search results', async () => {
      const allocation = {
        id: 1001,
        projectId: 3,
        date: '2025-09-07',
        projectName: 'project-name',
        projectCode: 'prj',
        startTime: '09:00',
        endTime: '17:00',
        numberOfOffendersAllocated: 5,
        numberOfOffendersWithOutcomes: 3,
        numberOfOffendersWithEA: 1,
      }

      const formattedSessionRows = [[{ text: 'Some value' }, { text: 'Another value' }]]

      resultTableRowsSpy.mockReturnValue(formattedSessionRows)

      const sessions: SessionSummariesDto = {
        allocations: [allocation],
      }

      const response = createMock<Response>()
      sessionService.getSessions.mockResolvedValue(sessions)

      const firstTeam = { id: 1, code: 'XR123', name: 'Team Lincoln' }
      const secondTeam = { id: 2, code: 'XR124', name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          team: 'XR123',
          'startDate-day': '07',
          'startDate-month': '07',
          'startDate-year': '2024',
          'endDate-day': '08',
          'endDate-month': '08',
          'endDate-year': '2025',
        },
      })

      const requestHandler = sessionsController.search()
      await requestHandler(req, response, next)

      expect(resultTableRowsSpy).toHaveBeenCalledWith(sessions)
      expect(response.render).toHaveBeenCalledWith(
        'sessions/index',
        expect.objectContaining({
          sessionRows: formattedSessionRows,
          showNoResultsMessage: false,
        }),
      )
    })

    it('showNoResultsMessage should be true if sessions list is empty', async () => {
      const sessions: SessionSummariesDto = {
        allocations: [],
      }
      resultTableRowsSpy.mockReturnValue([])
      sessionService.getSessions.mockResolvedValue(sessions)

      const providers = providerTeamSummaryFactory.buildList(2)
      providerService.getTeams.mockResolvedValue({ providers })

      const response = createMock<Response>()

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          team: 'XR123',
          'startDate-day': '07',
          'startDate-month': '07',
          'startDate-year': '2024',
          'endDate-day': '08',
          'endDate-month': '08',
          'endDate-year': '2025',
        },
      })

      const requestHandler = sessionsController.search()
      await requestHandler(req, response, next)

      expect(resultTableRowsSpy).toHaveBeenCalledWith(sessions)
      expect(response.render).toHaveBeenCalledWith(
        'sessions/index',
        expect.objectContaining({
          sessionRows: [],
          showNoResultsMessage: true,
        }),
      )
    })

    it('should return teamItems with selected team', async () => {
      const sessions: SessionSummariesDto = {
        allocations: [],
      }

      sessionService.getSessions.mockResolvedValue(sessions)

      const firstTeam = { id: 1, code: 'XR123', name: 'Team Lincoln' }
      const secondTeam = { id: 2, code: 'XR124', name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const response = createMock<Response>()
      const requestHandler = sessionsController.search()
      const requestWithTeam = createMock<Request>({})
      requestWithTeam.query.team = 'XR124'
      await requestHandler(requestWithTeam, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'sessions/index',
        expect.objectContaining({
          teamItems: [
            { value: firstTeam.code, text: firstTeam.name, selected: false },
            { value: secondTeam.code, text: secondTeam.name, selected: true },
          ],
        }),
      )
    })
  })

  describe('show', () => {
    it('should render the session page', async () => {
      const location = locationFactory.build()
      const session: SessionDto = {
        projectName: 'Cleaning',
        projectCode: 'cg',
        projectLocation: 'Lincoln',
        location,
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '12:00',
        appointmentSummaries: [],
      }

      sessionService.getSession.mockResolvedValue(session)

      const sessionList = [[{ text: 'name' }, { text: 'CRN123' }]]

      jest.spyOn(SessionUtils, 'sessionListTableRows').mockReturnValue(sessionList)

      const date = '1 January 2025'
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)

      const formattedLocation = '29 Acacia Road'
      jest.spyOn(LocationUtils, 'locationToParagraph').mockReturnValue(formattedLocation)

      const requestHandler = sessionsController.show()
      const response = createMock<Response>()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        session: {
          ...session,
          date,
          formattedLocation,
        },
        sessionList,
      })
    })
  })
})
