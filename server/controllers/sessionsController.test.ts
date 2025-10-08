import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { SessionDto, SessionSummariesDto } from '../@types/shared'
import SessionUtils from '../utils/sessionUtils'
import DateTimeFormats from '../utils/dateTimeUtils'

describe('SessionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let sessionsController: SessionsController
  const providerService = createMock<ProviderService>()
  const sessionService = createMock<SessionService>()

  beforeEach(() => {
    sessionsController = new SessionsController(providerService, sessionService)
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

    it('should throw an error if the request for team data fails', async () => {
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      providerService.getTeams.mockImplementation(() => {
        throw err
      })

      const response = createMock<Response>()
      await expect(requestHandler(request, response, next)).rejects.toThrow('Something went wrong')
    })

    it('should render the track progress page with errors', async () => {
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
          errors: {
            'startDate-day': { text: 'From date must include a day, month and year' },
            'endDate-day': { text: 'To date must include a day, month and year' },
          },
          errorSummary: [
            {
              text: 'From date must include a day, month and year',
              href: '#startDate-day',
            },
            {
              text: 'To date must include a day, month and year',
              href: '#endDate-day',
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

    it('should render empty session results if error code returned from session client', async () => {
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      sessionService.getSessions.mockImplementation(() => {
        throw err
      })

      const firstTeam = { id: 1, code: 'XR123', name: 'Team Lincoln' }
      const secondTeam = { id: 2, code: 'XR124', name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const response = createMock<Response>()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'sessions/index',
        expect.objectContaining({
          sessionRows: [],
        }),
      )
    })

    it('should return the formatted date query parameters', async () => {
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      sessionService.getSessions.mockImplementation(() => {
        throw err
      })

      const firstTeam = { id: 1, code: 'XR123', name: 'Team Lincoln' }
      const secondTeam = { id: 2, code: 'XR124', name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const response = createMock<Response>()
      const requestWithDates = createMock<Request>({})
      const query = {
        team: 'XR123',
        'startDate-day': '07',
        'startDate-month': '07',
        'startDate-year': '2024',
        'endDate-day': '08',
        'endDate-month': '08',
        'endDate-year': '2025',
      }

      requestWithDates.query = query
      await requestHandler(requestWithDates, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'sessions/index',
        expect.objectContaining({
          startDateItems: [
            {
              name: 'day',
              classes: 'govuk-input--width-2',
              value: '07',
            },
            {
              name: 'month',
              classes: 'govuk-input--width-2',
              value: '07',
            },
            {
              name: 'year',
              classes: 'govuk-input--width-4',
              value: '2024',
            },
          ],
          endDateItems: [
            {
              name: 'day',
              classes: 'govuk-input--width-2',
              value: '08',
            },
            {
              name: 'month',
              classes: 'govuk-input--width-2',
              value: '08',
            },
            {
              name: 'year',
              classes: 'govuk-input--width-4',
              value: '2025',
            },
          ],
        }),
      )
    })
  })

  describe('show', () => {
    it('should render the session page', async () => {
      const session: SessionDto = {
        projectName: 'Cleaning',
        projectCode: 'cg',
        projectLocation: 'Lincoln',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '12:00',
        appointmentSummaries: [],
      }

      sessionService.getSession.mockResolvedValue(session)

      const sessionList = [[{ text: 'name' }, { text: 'CRN123' }]]

      jest.spyOn(SessionUtils, 'sessionListTableRows').mockReturnValue(sessionList)

      const dateAndTime = '1 January 2025, 09:00 - 12:00'
      jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)

      const requestHandler = sessionsController.show()
      const response = createMock<Response>()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        session: {
          ...session,
          dateAndTime,
        },
        sessionList,
      })
    })
  })
})
