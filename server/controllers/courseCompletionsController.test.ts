import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseCompletionsController from './courseCompletionsController'
import CourseCompletionService from '../services/courseCompletionService'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import CourseCompletionIndexPage from '../pages/courseCompletionIndexPage'
import { GovUkFrontendDateInputItem } from '../forms/GovukFrontendDateInput'
import pagedModelCourseCompletionEventFactory from '../testutils/factories/pagedModelCourseCompletionEventFactory'
import pagedMetadataFactory from '../testutils/factories/pagedMetadataFactory'
import { getPaginationRequestParams } from '../utils/paginationUtils'

jest.mock('../pages/courseCompletionIndexPage')
jest.mock('../utils/paginationUtils')

describe('CourseCompletionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let courseCompletionsController: CourseCompletionsController
  const courseCompletionService = createMock<CourseCompletionService>()

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
    courseCompletionsController = new CourseCompletionsController(courseCompletionService)

    mockTableHeaders.mockReturnValue(courseCompletionTableHeaders)
    mockTableRows.mockReturnValue(courseCompletionTableRows)
    mockValidationErrors.mockReturnValue({})

    pageMock.mockImplementation(() => {
      return {
        validationErrors: mockValidationErrors,
        items: () => ({
          startDateItems: [] as GovUkFrontendDateInputItem[],
          endDateItems: [] as GovUkFrontendDateInputItem[],
        }),
        searchValues: () => ({
          dateFrom: '2025-12-27',
          dateTo: '2025-12-27',
        }),
        dateFields: () => ({
          'startDate-day': '27',
          'startDate-month': '12',
          'startDate-year': '2025',
          'endDate-day': '27',
          'endDate-month': '12',
          'endDate-year': '2025',
        }),
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
  })

  describe('index', () => {
    it('should render the search page', async () => {
      const response = createMock<Response>()

      const requestHandler = courseCompletionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courseCompletions/index')
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
          dateFrom: '2025-12-27',
          dateTo: '2025-12-27',
        },
      })

      const response = createMock<Response>()
      const requestHandler = courseCompletionsController.search()
      await requestHandler(req, response, next)

      expect(courseCompletionService.searchCourseCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2025-12-27',
          dateTo: '2025-12-27',
          providerCode: 'N56',
          page: 1,
          sortBy: 'someField',
          sortDirection: 'asc',
        }),
      )

      expect(response.render).toHaveBeenCalledWith(
        'courseCompletions/index',
        expect.objectContaining({
          courseCompletionRows: courseCompletionTableRows,
          courseCompletionTableHeaders,
          showNoResultsMessage: false,
          pageNumber: courseCompletions.page.number,
          totalPages: courseCompletions.page.totalPages,
          totalElements: courseCompletions.page.totalElements,
          pageSize: courseCompletions.page.size,
        }),
      )
    })

    it('showNoResultsMessage should be true when there are no results', async () => {
      const courseCompletions = pagedModelCourseCompletionEventFactory.build({ content: [] })

      courseCompletionService.searchCourseCompletions.mockResolvedValue(courseCompletions)
      mockTableHeaders.mockReturnValue([])
      mockTableRows.mockReturnValue([])

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          dateFrom: '2025-12-27',
          dateTo: '2025-12-27',
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
