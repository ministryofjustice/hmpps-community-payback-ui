import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseCompletionsController from '.'
import CourseCompletionService from '../../services/courseCompletionService'
import courseCompletionFactory from '../../testutils/factories/courseCompletionFactory'
import CourseCompletionIndexPage from '../../pages/courseCompletionIndexPage'
import pagedModelCourseCompletionEventFactory from '../../testutils/factories/pagedModelCourseCompletionEventFactory'
import pagedMetadataFactory from '../../testutils/factories/pagedMetadataFactory'
import { getPaginationRequestParams } from '../../utils/paginationUtils'
import ProviderService from '../../services/providerService'
import ReferenceDataService from '../../services/referenceDataService'
import getProvidersAndPdus, { ProvidersAndPdus } from '../shared/getProvidersAndPdus'

jest.mock('../../pages/courseCompletionIndexPage')
jest.mock('../../utils/paginationUtils')
jest.mock('../shared/getProvidersAndPdus')

describe('CourseCompletionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let courseCompletionsController: CourseCompletionsController
  const courseCompletionService = createMock<CourseCompletionService>()
  const providerService = createMock<ProviderService>()
  const referenceDataService = createMock<ReferenceDataService>()

  const providersAndPdus = {
    provider: { value: 'X', text: 'Provider' },
    pduItems: [
      { text: 'PDU 1', value: '1' },
      { text: 'PDU 2', value: '2' },
    ],
    providerItems: [
      { text: 'Provider 1', value: '1' },
      { text: 'Provider 2', value: '2' },
    ],
  }

  const getProvidersAndPdusMock: jest.Mock = getProvidersAndPdus as unknown as jest.Mock<Promise<ProvidersAndPdus>>

  const pageMock: jest.Mock = CourseCompletionIndexPage as unknown as jest.Mock<CourseCompletionIndexPage>

  const getPaginationRequestParamsMock: jest.Mock = getPaginationRequestParams as unknown as jest.Mock<
    ReturnType<typeof getPaginationRequestParams>
  >

  const mockValidationErrors = jest.fn()
  const mockTableRows = jest.fn()
  const mockTableHeaders = jest.fn()

  const courseCompletionTableHeaders = [
    { text: 'Name' },
    { text: 'ID' },
    { text: 'Course' },
    { text: 'Date completed' },
    { html: 'Actions' },
  ]
  const courseCompletionTableRows = [
    { text: 'Some name' },
    { text: 'Some ID' },
    { text: 'Some course name' },
    { text: 'Some date completed' },
    { html: 'View' },
  ]

  beforeEach(() => {
    jest.resetAllMocks()
    courseCompletionsController = new CourseCompletionsController(
      courseCompletionService,
      providerService,
      referenceDataService,
    )

    mockTableHeaders.mockReturnValue(courseCompletionTableHeaders)
    mockTableRows.mockReturnValue(courseCompletionTableRows)
    mockValidationErrors.mockReturnValue({})

    pageMock.mockImplementation(() => {
      return {
        validationErrors: mockValidationErrors,
        courseCompletionTableHeaders: mockTableHeaders,
        courseCompletionTableRows: mockTableRows,
      }
    })
    getPaginationRequestParamsMock.mockReturnValue({
      pageNumber: 1,
      hrefPrefix: 'someHrefPrefix',
      sortBy: 'someField',
      sortDirection: 'asc',
    })
    getProvidersAndPdusMock.mockResolvedValue(providersAndPdus)
  })

  describe('index', () => {
    it('should render the search page', async () => {
      const response = createMock<Response>()

      request.query = { provider: 'x' }

      const requestHandler = courseCompletionsController.index()
      await requestHandler(request, response, next)

      expect(getProvidersAndPdus).toHaveBeenCalledWith({
        response,
        providerService,
        referenceDataService,
        providerCode: 'x',
        pduId: undefined,
      })

      expect(response.render).toHaveBeenCalledWith('courseCompletions/index', { searchForm: providersAndPdus })
    })
  })

  describe('search', () => {
    it('should render the page with errors', async () => {
      const errors = {
        someError: { text: 'error message' },
      }
      mockValidationErrors.mockReturnValueOnce(errors)

      const requestHandler = courseCompletionsController.search()

      const req: DeepMocked<Request> = createMock<Request>({})

      const response = createMock<Response>()
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'courseCompletions/index',
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

    it('should render the page with results', async () => {
      const courseCompletions = pagedModelCourseCompletionEventFactory.build({
        page: { ...pagedMetadataFactory.build(), number: 2 },
      })

      courseCompletionService.searchCourseCompletions.mockResolvedValue(courseCompletions)

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          provider: 'N56',
          pdu: '123',
        },
      })

      const username = 'username'
      const response = createMock<Response>({ locals: { user: { username } } })
      const requestHandler = courseCompletionsController.search()
      await requestHandler(req, response, next)

      expect(courseCompletionService.searchCourseCompletions).toHaveBeenCalledWith({
        providerCode: 'N56',
        pduId: '123',
        page: 1,
        sortBy: 'someField',
        sortDirection: 'asc',
        resolutionStatus: 'Unresolved',
        username,
      })

      expect(response.render).toHaveBeenCalledWith('courseCompletions/index', {
        courseCompletionRows: courseCompletionTableRows,
        courseCompletionTableHeaders,
        showNoResultsMessage: false,
        hrefPrefix: 'someHrefPrefix',
        pageNumber: courseCompletions.page.number,
        totalPages: courseCompletions.page.totalPages,
        totalElements: courseCompletions.page.totalElements,
        pageSize: courseCompletions.page.size,
        searchForm: providersAndPdus,
      })
    })

    it('showNoResultsMessage should be true when there are no results', async () => {
      const courseCompletions = pagedModelCourseCompletionEventFactory.build({ content: [] })

      courseCompletionService.searchCourseCompletions.mockResolvedValue(courseCompletions)
      mockTableHeaders.mockReturnValue([])
      mockTableRows.mockReturnValue([])

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          pdu: '123',
        },
      })

      const response = createMock<Response>()
      const requestHandler = courseCompletionsController.search()
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'courseCompletions/index',
        expect.objectContaining({
          courseCompletionRows: [],
          showNoResultsMessage: true,
        }),
      )
    })
  })

  describe('show', () => {
    it('should render the show page', async () => {
      const response = createMock<Response>()

      const courseCompletion = courseCompletionFactory.build()

      courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)

      const requestHandler = courseCompletionsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'courseCompletions/show',
        expect.objectContaining({
          courseCompletion,
        }),
      )
    })
  })
})
