import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import OutcomeController from './outcomeController'
import CourseCompletionService from '../../../services/courseCompletionService'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

describe('OutcomeController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build({ timeToCredit: undefined })

  let outcomeController: OutcomeController
  const page = createMock<OutcomePage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    outcomeController = new OutcomeController(page, courseCompletionService, formService)
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

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        timeToCredit: { hours: undefined, minutes: undefined },
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })

    it('returns selected hours and minutes if values on form not undefined', async () => {
      const showPath = '/show'
      const formId = '12'
      const timeToCredit = { hours: '1', minutes: '30' }
      const formWithTime = courseCompletionFormFactory.build({ timeToCredit })
      formService.getForm.mockResolvedValue(formWithTime)

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)
      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

      const requestHandler = outcomeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        timeToCredit,
      })
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.submit()
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
      const errors = { hours: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        errors,
        errorSummary,
        timeToCredit: { hours: undefined, minutes: undefined },
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })

    it('returns hoursAndMinutes values in form if values on body not undefined', async () => {
      const showPath = '/show'
      const formId = '12'
      const teamCode = '13'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)

      const timeToCredit = { hours: '1', minutes: '30' }
      const formWithTime = courseCompletionFormFactory.build({ timeToCredit })
      formService.getForm.mockResolvedValue(formWithTime)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { hours: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: { team: teamCode } })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        errors,
        errorSummary,
        timeToCredit,
      })
    })
  })
})
