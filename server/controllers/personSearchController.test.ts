import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import AuditService, { Page } from '../services/auditService'
import PersonSearchController from './personSearchController'
import probationSearchResultFactory from '../testutils/factories/probationSearchResultFactory'

describe('PersonSearchController', () => {
  const username = 'username'
  const projectCode = 'PROJECT'
  const date = '2025-01-01'

  let personSearchController: PersonSearchController

  const auditService = createMock<AuditService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const request: DeepMocked<Request> = createMock<Request>({
    id: '1',
    params: {
      projectCode,
      date,
    },
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
    personSearchController = new PersonSearchController(auditService)
  })

  describe('show', () => {
    it('renders the find a person page', async () => {
      const requestHandler = personSearchController.show(Page.SEARCH_SESSIONS_FIND_A_PERSON, { backPath: '/' })
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/findAPerson', { backLink: '/' })
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

      const requestHandler = personSearchController.show(Page.SEARCH_SESSIONS_FIND_A_PERSON, { backPath: '/' })
      await requestHandler(request, responseWithResults, next)

      expect(auditService.sendAuditMessage).toHaveBeenCalledTimes(3)
      expect(responseWithResults.render).toHaveBeenCalledWith('pages/findAPerson', { backLink: '/' })
    })
  })

  it('renders the find a person page with result path if provided', async () => {
    const resultPath = '/some-path'
    const requestHandler = personSearchController.show(Page.SEARCH_SESSIONS_FIND_A_PERSON, {
      resultPath,
      backPath: '/',
    })
    await requestHandler(request, response, next)

    expect(response.render).toHaveBeenCalledWith('pages/findAPerson', { resultPath, backLink: '/' })
  })
})
