import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import PersonController from './personController'
import CourseCompletionService from '../../../services/courseCompletionService'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

describe('PersonController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()

  let personController: PersonController
  const page = createMock<PersonPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    personController = new PersonController(page, courseCompletionService, formService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = personController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = personController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(formService.saveForm).toHaveBeenCalled()
    })

    it('rerenders page if validation errors', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { isMatch: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = personController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, errors, errorSummary })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })
})
