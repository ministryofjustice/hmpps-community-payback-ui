import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import PersonController from './personController'
import CourseCompletionService from '../../../services/courseCompletionService'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'

describe('PersonController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const courseCompletion = courseCompletionFactory.build()

  let personController: PersonController
  const page = createMock<PersonPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    personController = new PersonController(page, courseCompletionService)
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

      const requestHandler = personController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = personController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })
  })
})
