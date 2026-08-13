import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import AuditService, { Page } from '../services/auditService'
import PeopleController from './peopleController'
import probationSearchResultFactory from '../testutils/factories/probationSearchResultFactory'
import AppointmentFormService from '../services/forms/appointmentFormService'
import createAppointmentFormFactory from '../testutils/factories/createAppointmentFormFactory'
import { pathWithQuery } from '../utils/utils'

describe('PeopleController', () => {
  const username = 'username'
  const projectCode = 'PROJECT'
  const date = '2025-01-01'

  let peopleController: PeopleController

  const auditService = createMock<AuditService>()
  const appointmentFormService = createMock<AppointmentFormService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const request: DeepMocked<Request> = createMock<Request>({
    id: '1',
    params: {
      projectCode,
      date,
    },
    query: {},
  })

  const response: DeepMocked<Response> = createMock<Response>({
    locals: {
      user: {
        username,
      },
      searchResults: {
        response: {
          content: [],
        },
      },
    },
    render: jest.fn(),
  })

  beforeEach(() => {
    jest.clearAllMocks()
    peopleController = new PeopleController(auditService, appointmentFormService)
  })

  describe('show', () => {
    it('renders the find a person page', async () => {
      const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
        backPath: '/',
        resultPath: '/some-path',
      })
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('people/index', { backLink: '/', resultPath: '/some-path' })
    })

    it('renders the find a person page and sends an audit message for each result', async () => {
      const results = probationSearchResultFactory.buildList(3)
      const responseWithResults: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: {
            username,
          },
          searchResults: {
            response: {
              content: results,
            },
          },
        },
        render: jest.fn(),
      })

      const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
        backPath: '/',
        resultPath: '/some-path',
      })
      await requestHandler(request, responseWithResults, next)

      expect(auditService.sendAuditMessage).toHaveBeenCalledTimes(3)
      expect(responseWithResults.render).toHaveBeenCalledWith('people/index', {
        backLink: '/',
        resultPath: '/some-path',
      })
    })

    describe('when a formId exists in the query', () => {
      it('uses the form originalSearch as the query for backLink and resultPath', async () => {
        const formId = 'form-1'
        const requestWithForm: DeepMocked<Request> = createMock<Request>({
          id: '1',
          params: { projectCode, date },
          query: { form: formId },
        })
        const form = createAppointmentFormFactory.build({ originalSearch: { provider: 'provider-1', team: 'team-1' } })
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
          backPath: '/',
          resultPath: '/some-path',
        })
        await requestHandler(requestWithForm, response, next)

        expect(appointmentFormService.getForm).toHaveBeenCalledWith(formId, username)
        expect(response.render).toHaveBeenCalledWith('people/index', {
          backLink: pathWithQuery('/', form.originalSearch),
          resultPath: pathWithQuery('/some-path', { form: formId }),
        })
      })

      it('never appends the formId to backLink', async () => {
        const formId = 'form-1'
        const requestWithForm: DeepMocked<Request> = createMock<Request>({
          id: '1',
          params: { projectCode, date },
          query: { form: formId },
        })
        const form = createAppointmentFormFactory.build({ originalSearch: { provider: 'provider-1', team: 'team-1' } })
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
          backPath: '/',
          resultPath: '/some-path',
        })
        await requestHandler(requestWithForm, response, next)

        const renderData = response.render.mock.calls[0][1] as unknown as Record<string, string>
        expect(renderData.backLink).not.toContain('form=')
      })
    })

    describe('when other query properties exist and no formId is present', () => {
      it('appends them to backLink and resultPath', async () => {
        const requestWithQuery: DeepMocked<Request> = createMock<Request>({
          id: '1',
          params: { projectCode, date },
          query: { page: '2', sortBy: 'lastName' },
        })

        const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
          backPath: '/',
          resultPath: '/some-path',
        })
        await requestHandler(requestWithQuery, response, next)

        expect(appointmentFormService.getForm).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalledWith('people/index', {
          backLink: pathWithQuery('/', { page: '2', sortBy: 'lastName' }),
          resultPath: pathWithQuery('/some-path', { page: '2', sortBy: 'lastName' }),
        })
      })
    })
  })
})
