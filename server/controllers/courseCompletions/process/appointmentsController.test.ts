import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentsController from './appointmentsController'
import CourseCompletionService from '../../../services/courseCompletionService'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

describe('AppointmentsController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()

  let appointmentsController: AppointmentsController
  const page = createMock<AppointmentPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new AppointmentsController(page, courseCompletionService, formService)
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
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = appointmentsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
      expect(formService.getForm).toHaveBeenCalled()
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
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
      const errors = { appointmentId: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, errors, errorSummary })
    })
  })
})
