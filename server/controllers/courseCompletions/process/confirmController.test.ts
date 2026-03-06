import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ConfirmController from './confirmController'
import CourseCompletionService from '../../../services/courseCompletionService'
import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'

describe('ConfirmController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const courseCompletion = courseCompletionFactory.build()

  let confirmController: ConfirmController
  const page = createMock<ConfirmPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    confirmController = new ConfirmController(page, courseCompletionService)
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
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = confirmController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })
  })
})
