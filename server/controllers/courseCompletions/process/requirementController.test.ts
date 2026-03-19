import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import RequirementController from './requirementController'
import CourseCompletionService from '../../../services/courseCompletionService'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import OffenderService from '../../../services/offenderService'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'

describe('RequirementController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const offenderService = createMock<OffenderService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const caseDetailsSummary = caseDetailsSummaryFactory.build()

  let requirementController: RequirementController
  const page = createMock<RequirementPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    requirementController = new RequirementController(page, courseCompletionService, formService, offenderService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    formService.getForm.mockResolvedValue(form)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const unpaidWorkOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unpaidWorkOptions,
      }
      page.viewData.mockReturnValue(viewData)
      page.getUnpaidWorkOptions.mockReturnValue(unpaidWorkOptions)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = requirementController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = requirementController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(formService.saveForm).toHaveBeenCalled()
    })

    it('rerenders page if validation errors', async () => {
      const unpaidWorkOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unpaidWorkOptions,
      }
      page.viewData.mockReturnValue(viewData)
      page.getUnpaidWorkOptions.mockReturnValue(unpaidWorkOptions)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { requirementNumber: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = requirementController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, errors, errorSummary })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })
})
