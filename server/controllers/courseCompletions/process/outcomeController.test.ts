import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import OutcomeController from './outcomeController'
import CourseCompletionService from '../../../services/courseCompletionService'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'

describe('OutcomeController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const courseCompletion = courseCompletionFactory.build()

  let outcomeController: OutcomeController
  const page = createMock<OutcomePage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    outcomeController = new OutcomeController(page, courseCompletionService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        offender: { name: 'Mary Smith' },
      }
      page.viewData.mockReturnValue(viewData)
      const request = createMock<Request>({ params: { id: '1' } })

      const requestHandler = outcomeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      const request = createMock<Request>({ params: { id: '1' } })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })
  })
})
