import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { SessionDto, SessionSummariesDto } from '../@types/shared'
import SessionUtils from '../utils/sessionUtils'
import DateTimeFormats from '../utils/dateTimeUtils'
import GroupSessionIndexPage from '../pages/groupSessionIndexPage'
import { GovUkFrontendDateInputItem } from '../forms/GovukFrontendDateInput'
import LocationUtils from '../utils/locationUtils'
import * as ErrorUtils from '../utils/errorUtils'
import sessionSummaryFactory from '../testutils/factories/sessionSummaryFactory'
import getProvidersAndTeams, { ProvidersAndTeams } from './shared/getProvidersAndTeams'
import sessionFactory from '../testutils/factories/sessionFactory'
import appointmentSummaryFactory from '../testutils/factories/appointmentSummaryFactory'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import offenderLimitedFactory from '../testutils/factories/offenderLimitedFactory'
import pagedMetadataFactory from '../testutils/factories/pagedMetadataFactory'
import { getPaginationRequestParams } from '../utils/paginationUtils'
import paths from '../paths'
import { pathWithQuery } from '../utils/utils'
import AuditService from '../services/auditService'
import ProjectService from '../services/projectService'
import projectFactory from '../testutils/factories/projectFactory'

jest.mock('../pages/groupSessionIndexPage')
jest.mock('./shared/getProvidersAndTeams')
jest.mock('../utils/paginationUtils')

describe('SessionsController', () => {
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let sessionsController: SessionsController
  const auditService = createMock<AuditService>()
  const providerService = createMock<ProviderService>()
  const sessionService = createMock<SessionService>()
  const projectService = createMock<ProjectService>()
  const pageMock: jest.Mock = GroupSessionIndexPage as unknown as jest.Mock<GroupSessionIndexPage>

  const getPaginationRequestParamsMock: jest.Mock = getPaginationRequestParams as unknown as jest.Mock<
    ReturnType<typeof getPaginationRequestParams>
  >

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
    sessionsController = new SessionsController(auditService, providerService, sessionService, projectService)
    pageMock.mockImplementation(() => {
      return {
        validationErrors: () => ({}),
        items: () => ({
          dateItems: [] as GovUkFrontendDateInputItem[],
        }),
        searchValues: () => ({
          startDate: '2025-12-27',
          endDate: '2025-12-27',
        }),
        teamCode: 'XR2',
      }
    })
    getProvidersMock.mockResolvedValue(providersAndTeams)

    getPaginationRequestParamsMock.mockReturnValue({
      hrefPrefix: 'someHrefPrefix',
    })
  })

  describe('index', () => {
    it('should render the dashboard page', async () => {
      const request = createMock<Request>({ query: {} })
      const response = createMock<Response>()

      const requestHandler = sessionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', { form: providersAndTeams })
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
          dateItems: [] as GovUkFrontendDateInputItem[],
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
        form: { ...providersAndTeams, dateItems: [] },
        errors,
        errorSummary: [
          expect.objectContaining({
            text: errors.someError.text,
            href: '#someError',
          }),
        ],
        sessionRows: [],
      })
    })

    it('should render the dashboard page with search results', async () => {
      const formattedSessionRows = [[{ text: 'Some value' }, { text: 'Another value' }]]

      resultTableRowsSpy.mockReturnValue(formattedSessionRows)

      const sessions: SessionSummariesDto = {
        allocations: sessionSummaryFactory.buildList(2),
        content: sessionSummaryFactory.buildList(2),
        page: pagedMetadataFactory.build(),
      }

      const response = createMock<Response>()
      sessionService.getSessions.mockResolvedValue(sessions)

      const req: DeepMocked<Request> = createMock<Request>({})

      const requestHandler = sessionsController.search()
      await requestHandler(req, response, next)

      expect(resultTableRowsSpy).toHaveBeenCalledWith(sessions, expect.any(Object) as DeepMocked<Request>)
      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        form: {
          ...providersAndTeams,
          dateItems: [],
        },
        sessionRows: formattedSessionRows,
        showNoResultsMessage: false,
        pageNumber: sessions.page.number,
        pageSize: sessions.page.size,
        totalElements: sessions.page.totalElements,
        totalPages: sessions.page.totalPages,
        hrefPrefix: 'someHrefPrefix',
      })
    })

    it('showNoResultsMessage should be true if sessions list is empty', async () => {
      const sessions: SessionSummariesDto = {
        allocations: [],
        content: [],
        page: pagedMetadataFactory.build(),
      }
      resultTableRowsSpy.mockReturnValue([])
      sessionService.getSessions.mockResolvedValue(sessions)

      const response = createMock<Response>()

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          team: 'XR123',
          'date-day': '07',
          'date-month': '07',
          'date-year': '2024',
        },
      })

      const requestHandler = sessionsController.search()
      await requestHandler(req, response, next)

      expect(resultTableRowsSpy).toHaveBeenCalledWith(sessions, expect.any(Object) as DeepMocked<Request>)
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
      const session: SessionDto = sessionFactory.build()
      const project = projectFactory.build()

      sessionService.getSession.mockResolvedValue(session)
      projectService.getProject.mockResolvedValue(project)

      const sessionList = [[{ text: 'name' }, { text: 'CRN123' }]]

      jest.spyOn(SessionUtils, 'sessionListTableRows').mockReturnValue(sessionList)

      const date = '1 January 2025'
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)

      const formattedLocation = '29 Acacia Road'
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(formattedLocation)

      const errorList = [{ text: 'Some error' }]
      jest.spyOn(ErrorUtils, 'generateErrorTextList').mockReturnValue(errorList)

      const backPath = paths.sessions.index({})

      const requestHandler = sessionsController.show()
      const projectCode = '12'
      const request = createMock<Request>({ query: {}, params: { projectCode, date } })
      const response = createMock<Response>()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        session: {
          ...session,
          date,
          formattedLocation,
          region: project.providerName,
          team: project.teamName,
          projectType: project.projectType.name,
        },
        sessionList,
        backPath,
        errorList,
      })
    })

    it('should pass search back link to view if provider param', async () => {
      const search = { provider: 'provider ' }
      jest.spyOn(GroupSessionIndexPage, 'objectContainsSearchProperty').mockReturnValue(true)

      const backPath = pathWithQuery(paths.sessions.search({}), search)

      const requestHandler = sessionsController.show()
      const response = createMock<Response>()
      const requestWithQuery = createMock<Request>({ query: search, params: { projectCode: '1', date: '12/34' } })

      await requestHandler(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', expect.objectContaining({ backPath }))
    })

    describe('bulkUpdatePath', () => {
      it('should return bulk update path if at least one appointment has no contact outcome and full offender', async () => {
        const projectCode = 'P123'
        const date = '2026-06-12'
        const query = { provider: 'P1' }

        const session: SessionDto = sessionFactory.build({
          projectCode,
          date,
          appointmentSummaries: [
            appointmentSummaryFactory.build({
              contactOutcome: undefined,
              offender: offenderFullFactory.build(),
            }),
          ],
        })
        sessionService.getSession.mockResolvedValue(session)

        const requestHandler = sessionsController.show()
        const response = createMock<Response>()
        const request = createMock<Request>({ params: { projectCode, date }, query })

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'sessions/show',
          expect.objectContaining({
            bulkUpdatePath: pathWithQuery(paths.sessions.update({ projectCode, date, page: 'select-people' }), query),
          }),
        )
      })

      it('should not return bulk update path if there is no full offender', async () => {
        const projectCode = 'P123'
        const date = '2026-06-12'
        const query = { provider: 'P1' }

        const session: SessionDto = sessionFactory.build({
          projectCode,
          date,
          appointmentSummaries: [
            appointmentSummaryFactory.build({
              contactOutcome: undefined,
              offender: offenderLimitedFactory.build(),
            }),
          ],
        })
        sessionService.getSession.mockResolvedValue(session)

        const requestHandler = sessionsController.show()
        const response = createMock<Response>()
        const request = createMock<Request>({ params: { projectCode, date }, query })

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'sessions/show',
          expect.objectContaining({
            bulkUpdatePath: undefined,
          }),
        )
      })

      it('should not return bulk update path if all appointments have contact outcomes', async () => {
        const projectCode = 'P123'
        const date = '2026-06-12'
        const query = { provider: 'P1' }

        const session: SessionDto = sessionFactory.build({
          projectCode,
          date,
          appointmentSummaries: [
            appointmentSummaryFactory.build({
              offender: offenderFullFactory.build(),
            }),
            appointmentSummaryFactory.build({
              offender: offenderFullFactory.build(),
            }),
          ],
        })
        sessionService.getSession.mockResolvedValue(session)

        const requestHandler = sessionsController.show()
        const response = createMock<Response>()
        const request = createMock<Request>({ params: { projectCode, date }, query })

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'sessions/show',
          expect.objectContaining({
            bulkUpdatePath: undefined,
          }),
        )
      })
    })
  })
})
