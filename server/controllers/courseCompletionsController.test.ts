import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseCompletionsController from './courseCompletionsController'
import CourseCompletionService from '../services/courseCompletionService'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import CourseCompletionUtils from '../utils/courseCompletionUtils'
import CourseCompletionIndexPage from '../pages/courseCompletionIndexPage'
import { GovUkFrontendDateInputItem } from '../forms/GovukFrontendDateInput'
import pagedModelCourseCompletionEventFactory from '../testutils/factories/pagedModelCourseCompletionEventFactory'

jest.mock('../pages/courseCompletionIndexPage')

describe('CourseCompletionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let courseCompletionsController: CourseCompletionsController
  const courseCompletionService = createMock<CourseCompletionService>()

  const pageMock: jest.Mock = CourseCompletionIndexPage as unknown as jest.Mock<CourseCompletionIndexPage>

  beforeEach(() => {
    jest.resetAllMocks()
    courseCompletionsController = new CourseCompletionsController(courseCompletionService)
    pageMock.mockImplementation(() => {
      return {
        validationErrors: () => ({}),
        items: () => ({
          startDateItems: [] as GovUkFrontendDateInputItem[],
          endDateItems: [] as GovUkFrontendDateInputItem[],
        }),
        searchValues: () => ({
          dateFrom: '2025-12-27',
          dateTo: '2025-12-27',
        }),
      }
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
    const resultTableRowsSpy = jest.spyOn(CourseCompletionUtils, 'courseCompletionTableRows')

    beforeEach(() => {
      resultTableRowsSpy.mockReturnValue([])
    })

    it('should render the page with errors', async () => {
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
      const courseCompletions = pagedModelCourseCompletionEventFactory.build()

      courseCompletionService.searchCourseCompletions.mockResolvedValue(courseCompletions)

      const courseCompletionTableRows = [[{ text: 'Some value' }, { text: 'Another value' }]]

      resultTableRowsSpy.mockReturnValue(courseCompletionTableRows)

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
        }),
      )
      expect(resultTableRowsSpy).toHaveBeenCalledWith(courseCompletions.content)

      expect(response.render).toHaveBeenCalledWith(
        'courseCompletions/index',
        expect.objectContaining({
          courseCompletionRows: courseCompletionTableRows,
          showNoResultsMessage: false,
        }),
      )
    })

    it('showNoResultsMessage should be true when there are no results', async () => {
      const courseCompletions = pagedModelCourseCompletionEventFactory.build({ content: [] })

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
