import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentsController from './appointmentsController'
import CourseCompletionService from '../../../services/courseCompletionService'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import AppointmentService from '../../../services/appointmentService'
import pagedModelAppointmentSummaryFactory from '../../../testutils/factories/pagedModelAppointmentSummaryFactory'
import * as Utils from '../../../utils/utils'

describe('AppointmentsController', () => {
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user: { username: 'username' } } })
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const appointmentService = createMock<AppointmentService>()

  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const pagedModelAppointmentSummary = pagedModelAppointmentSummaryFactory.build()

  let appointmentsController: AppointmentsController
  const page = createMock<AppointmentPage>({ templatePath })

  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new AppointmentsController(page, courseCompletionService, formService, appointmentService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    appointmentService.getAppointments.mockResolvedValue(pagedModelAppointmentSummary)
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const appointmentOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        appointmentOptions,
        createNewAppointmentPath: pathWithQuery,
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.getAppointmentOptions.mockReturnValue(appointmentOptions)
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
  })

  describe('create', () => {
    it('updates the form and redirects to the outcome page', async () => {
      jest.spyOn(Utils, 'pathWithQuery').mockRestore()

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = appointmentsController.create()
      await requestHandler(request, response, next)

      expect(formService.saveForm).toHaveBeenCalledWith(
        '12',
        'username',
        expect.objectContaining({
          appointmentIdToUpdate: undefined,
          timeToCredit: undefined,
          'date-day': undefined,
          'date-month': undefined,
          'date-year': undefined,
        }),
      )
      expect(response.redirect).toHaveBeenCalledWith('/course-completions/1/outcome?form=12')
    })
  })
})
