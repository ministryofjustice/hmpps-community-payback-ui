import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { SessionDto, SessionSummariesDto } from '../@types/shared'
import SessionUtils from '../utils/sessionUtils'
import DateTimeFormats from '../utils/dateTimeUtils'
import locationFactory from '../testutils/factories/locationFactory'
import GroupSessionIndexPage from '../pages/groupSessionIndexPage'
import { GovUkFrontendDateInputItem } from '../forms/GovukFrontendDateInput'
import LocationUtils from '../utils/locationUtils'
import * as ErrorUtils from '../utils/errorUtils'
import { GovUkSelectOption } from '../@types/user-defined'
import getProviders from './shared/getProviders'
import sessionSummaryFactory from '../testutils/factories/sessionSummaryFactory'
import getTeams from './shared/getTeams'

jest.mock('../pages/groupSessionIndexPage')
jest.mock('./shared/getProviders')
jest.mock('./shared/getTeams')

describe('SessionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let sessionsController: SessionsController
  const providerService = createMock<ProviderService>()
  const sessionService = createMock<SessionService>()
  const pageMock: jest.Mock = GroupSessionIndexPage as unknown as jest.Mock<GroupSessionIndexPage>
  const teamItems = [
    { text: 'Team 1', value: '11' },
    { text: 'Team 2', value: '12' },
  ]

  const getTeamsMock: jest.Mock = getTeams as unknown as jest.Mock<Promise<Array<GovUkSelectOption>>>

  const providerItems = [
    { text: 'Provider 1', value: '1' },
    { text: 'Provider 2', value: '2' },
  ]

  const getProvidersMock: jest.Mock = getProviders as unknown as jest.Mock<Promise<Array<GovUkSelectOption>>>

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
    getProvidersMock.mockResolvedValue(providerItems)
    getTeamsMock.mockResolvedValue(teamItems)
  })

  describe('index', () => {
    it('should render the dashboard page', async () => {
      const response = createMock<Response>()

      const requestHandler = sessionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems,
        providerItems,
      })
    })
  })

  describe('search', () => {
    const resultTableRowsSpy = jest.spyOn(SessionUtils, 'sessionResultTableRows')

    beforeEach(() => {
      resultTableRowsSpy.mockReturnValue([])
    })

    it('should render the group session index page with errors', async () => {
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

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          team: 'XR123',
        },
      })

      const response = createMock<Response>()
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems,
        providerItems,
        startDateItems: [],
        endDateItems: [],
        errors,
        errorSummary: [
          {
            text: errors.someError.text,
            href: '#someError',
          },
        ],
        sessionRows: [],
      })
    })

    it('should render the dashboard page with search results', async () => {
      const formattedSessionRows = [[{ text: 'Some value' }, { text: 'Another value' }]]

      resultTableRowsSpy.mockReturnValue(formattedSessionRows)

      const sessions: SessionSummariesDto = {
        allocations: sessionSummaryFactory.buildList(2),
      }

      const response = createMock<Response>()
      sessionService.getSessions.mockResolvedValue(sessions)

      const req: DeepMocked<Request> = createMock<Request>()

      const requestHandler = sessionsController.search()
      await requestHandler(req, response, next)

      expect(resultTableRowsSpy).toHaveBeenCalledWith(sessions)
      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems,
        providerItems,
        startDateItems: [],
        endDateItems: [],
        sessionRows: formattedSessionRows,
        showNoResultsMessage: false,
      })
    })

    it('showNoResultsMessage should be true if sessions list is empty', async () => {
      const sessions: SessionSummariesDto = {
        allocations: [],
      }
      resultTableRowsSpy.mockReturnValue([])
      sessionService.getSessions.mockResolvedValue(sessions)

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
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(formattedLocation)

      const errorList = [{ text: 'Some error' }]
      jest.spyOn(ErrorUtils, 'generateErrorTextList').mockReturnValue(errorList)

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
        errorList,
      })
    })
  })
})
