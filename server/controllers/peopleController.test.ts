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
    const backPath = '/'
    const resultPath = '/some-path'

    it('renders the find a person page', async () => {
      const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
        backPath,
        resultPath,
      })
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('people/index', { backLink: backPath, resultPath })
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
        backPath,
        resultPath,
      })
      await requestHandler(request, responseWithResults, next)

      expect(auditService.sendAuditMessage).toHaveBeenCalledTimes(3)
      expect(responseWithResults.render).toHaveBeenCalledWith('people/index', {
        backLink: backPath,
        resultPath,
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
          backPath,
          resultPath,
        })
        await requestHandler(requestWithForm, response, next)

        expect(appointmentFormService.getForm).toHaveBeenCalledWith(formId, username)
        expect(response.render).toHaveBeenCalledWith('people/index', {
          backLink: form.originalPath,
          resultPath: pathWithQuery(resultPath, { form: formId }),
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
          backPath,
          resultPath,
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
          backPath,
          resultPath,
        })
        await requestHandler(requestWithQuery, response, next)

        expect(appointmentFormService.getForm).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalledWith('people/index', {
          backLink: pathWithQuery(backPath, { page: '2', sortBy: 'lastName' }),
          resultPath: pathWithQuery(resultPath, { page: '2', sortBy: 'lastName' }),
        })
      })
    })

    describe('when originalPath exists in the query and no formId is present', () => {
      it('uses the decoded originalPath as the backLink without calling the form service', async () => {
        const originalPath = '/original/path?x=1'
        const encodedOriginalPath = encodeURIComponent(originalPath)
        const requestWithOriginalPath: DeepMocked<Request> = createMock<Request>({
          id: '1',
          params: { projectCode, date },
          query: { originalPath: encodedOriginalPath },
        })

        const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
          backPath,
          resultPath,
        })
        await requestHandler(requestWithOriginalPath, response, next)

        expect(appointmentFormService.getForm).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalledWith('people/index', {
          backLink: originalPath,
          resultPath: pathWithQuery(resultPath, { originalPath: encodedOriginalPath }, { encode: true }),
        })
      })
    })

    describe('when both formId and originalPath exist in the query', () => {
      it('uses the form originalPath and ignores the query originalPath', async () => {
        const formId = 'form-1'
        const queryOriginalPath = '/should-be-ignored'
        const encodedQueryOriginalPath = encodeURIComponent(queryOriginalPath)
        const formOriginalPath = '/from-form-service'
        const requestWithBoth: DeepMocked<Request> = createMock<Request>({
          id: '1',
          params: { projectCode, date },
          query: { form: formId, originalPath: encodedQueryOriginalPath },
        })
        const form = createAppointmentFormFactory.build({ originalPath: formOriginalPath })
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
          backPath,
          resultPath,
        })
        await requestHandler(requestWithBoth, response, next)

        expect(response.render).toHaveBeenCalledWith('people/index', {
          backLink: formOriginalPath,
          resultPath: pathWithQuery(
            resultPath,
            {
              form: formId,
              originalPath: encodedQueryOriginalPath,
            },
            { encode: true },
          ),
        })
      })
    })
  })
})
