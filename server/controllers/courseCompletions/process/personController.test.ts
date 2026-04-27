import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import PersonController from './personController'
import CourseCompletionService from '../../../services/courseCompletionService'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import OffenderService from '../../../services/offenderService'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'

describe('PersonController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const offenderService = createMock<OffenderService>()

  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const caseDetailsSummary = caseDetailsSummaryFactory.build()

  const stepViewData = {
    learnerDetails: {
      firstName: 'Mary',
      lastName: 'Smith',
      dateOfBirth: '12 January 1990',
      email: 'example@email.com',
      region: 'Greater Manchester',
      pdu: 'Central',
      office: 'Chester St',
    },
    offenderDetails: {
      firstName: 'Mary',
      lastName: 'Smith',
      dateOfBirth: '12 January 1990',
      crn: 'X000000',
      isLimited: false,
    },
    crnPagePath: 'crn-page-path',
  }

  let personController: PersonController
  const page = createMock<PersonPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    personController = new PersonController(page, courseCompletionService, formService, offenderService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
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
      page.stepViewData.mockReturnValue(stepViewData)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = personController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, ...stepViewData })
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
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue(stepViewData)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { isMatch: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = personController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, ...stepViewData, errors, errorSummary })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })
})
