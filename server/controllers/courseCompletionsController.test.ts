import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseCompletionsController from './courseCompletionsController'
import CourseCompletionService from '../services/courseCompletionService'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'

describe('CourseCompletionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let courseCompletionsController: CourseCompletionsController
  const courseCompletionService = createMock<CourseCompletionService>()

  beforeEach(() => {
    courseCompletionsController = new CourseCompletionsController(courseCompletionService)
  })

  describe('index', () => {
    it('should render the search page', async () => {
      const response = createMock<Response>()

      const requestHandler = courseCompletionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courseCompletions/index')
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
