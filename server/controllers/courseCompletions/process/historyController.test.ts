import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import HistoryController from './historyController'
import CourseCompletionService from '../../../services/courseCompletionService'
import HistoryPage from '../../../pages/courseCompletions/process/historyPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import AppointmentService from '../../../services/appointmentService'
import pagedModelAppointmentSummaryFactory from '../../../testutils/factories/pagedModelAppointmentSummaryFactory'
import DateTimeFormats from '../../../utils/dateTimeUtils'

describe('HistoryController', () => {
  const username = 'user1'
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const appointmentService = createMock<AppointmentService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const toDate = '2026-03-01'
  const fromDate = '2025-03-01'
  const appointmentCards = [
    {
      title: '12 January 2026',
      rows: [
        { key: { text: 'Time credited' }, value: { text: '1 hour 30 minutes' } },
        { key: { text: 'Outcome' }, value: { text: 'Attended - complied' } },
      ],
    },
    {
      title: '13 January 2026',
      rows: [
        { key: { text: 'Time credited' }, value: { text: '30 minutes' } },
        { key: { text: 'Outcome' }, value: { text: 'Attended - complied' } },
      ],
    },
  ]

  let historyController: HistoryController
  const page = createMock<HistoryPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    historyController = new HistoryController(page, courseCompletionService, formService, appointmentService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    jest
      .spyOn(DateTimeFormats, 'getTodaysDatePlusDays')
      .mockReturnValue({ formattedDate: fromDate, year: '', day: '', month: '' })
    jest.spyOn(DateTimeFormats, 'dateObjToIsoString').mockReturnValue(toDate)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue({ appointmentCards })

      const appointments = pagedModelAppointmentSummaryFactory.build()
      appointmentService.getAppointments.mockResolvedValue(appointments)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = historyController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, appointmentCards })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(appointmentService.getAppointments).toHaveBeenCalledWith(username, {
        projectTypeGroup: 'ETE',
        outcomeCodes: ['ATTC'],
        toDate,
        fromDate,
        crn: form.crn,
        sort: ['date,desc'],
      })
    })

    it('handles null content in appointment response', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue({ appointmentCards: [] })

      appointmentService.getAppointments.mockResolvedValue({})

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = historyController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, appointmentCards: [] })
      expect(page.stepViewData).toHaveBeenCalledWith([])
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = historyController.submit()
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
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue({ appointmentCards })

      const appointments = pagedModelAppointmentSummaryFactory.build()
      appointmentService.getAppointments.mockResolvedValue(appointments)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { canCreditHours: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = historyController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        appointmentCards,
        errors,
        errorSummary,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })
})
