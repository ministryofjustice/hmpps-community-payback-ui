import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ConfirmController from './confirmController'
import CourseCompletionService from '../../../services/courseCompletionService'
import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

describe('ConfirmController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()

  let confirmController: ConfirmController
  const page = createMock<ConfirmPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    confirmController = new ConfirmController(page, courseCompletionService, formService)
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

      const submittedItems = [
        { key: { text: 'CRN' }, value: { text: 'some crn' } },
        { key: { text: 'Project' }, value: { text: 'Some project' } },
      ]
      page.stepViewData.mockReturnValue({ submittedItems })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = confirmController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, submittedItems })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })

    it('rerenders page if validation errors', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)

      const submittedItems = [
        { key: { text: 'CRN' }, value: { text: 'some crn' } },
        { key: { text: 'Project' }, value: { text: 'Some project' } },
      ]
      page.stepViewData.mockReturnValue({ submittedItems })
      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { alert: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' } })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, submittedItems, errors, errorSummary })
    })
  })
})
