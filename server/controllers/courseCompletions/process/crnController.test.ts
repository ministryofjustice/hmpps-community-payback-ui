import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CrnController from './crnController'
import CourseCompletionService from '../../../services/courseCompletionService'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'

describe('CrnController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const courseCompletion = courseCompletionFactory.build()

  let crnController: CrnController
  const page = createMock<CrnPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    crnController = new CrnController(page, courseCompletionService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const crn = '1'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        offender: { name: 'Mary Smith' },
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue({ crn })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = crnController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, crn })
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = crnController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })

    it('rerenders page if validation errors', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        offender: { name: 'Mary Smith' },
      }
      page.viewData.mockReturnValue(viewData)
      const crn = '123'
      page.stepViewData.mockReturnValue({ crn })

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { crn: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' } })

      const requestHandler = crnController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, crn, errors, errorSummary })
    })
  })
})
