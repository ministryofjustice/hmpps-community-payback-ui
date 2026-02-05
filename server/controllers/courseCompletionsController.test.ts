import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseCompletionsController from './courseCompletionsController'

describe('CourseCompletionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let courseCompletionsController: CourseCompletionsController

  beforeEach(() => {
    courseCompletionsController = new CourseCompletionsController()
  })

  describe('index', () => {
    it('should render the search page', async () => {
      const response = createMock<Response>()

      const requestHandler = courseCompletionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courseCompletions/index')
    })
  })
})
