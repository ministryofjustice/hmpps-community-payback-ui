import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import UnableToCreditTimeController from './unableToCreditTimeController'
import CourseCompletionService from '../../../services/courseCompletionService'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import OffenderService from '../../../services/offenderService'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import paths from '../../../paths'
import courseCompletionResolutionFactory from '../../../testutils/factories/courseCompletionResolutionFactory'
import * as ErrorUtils from '../../../utils/errorUtils'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'

describe('UnableToCreditTimeController', () => {
  const username = 'username'
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const offenderService = createMock<OffenderService>()

  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const offenderResponse = caseDetailsSummaryFactory.build()
  const errorResponse = {
    hasErrors: false,
    errorSummary: [] as ErrorUtils.ErrorSummaryItem[],
    errors: {},
  }

  let unableToCreditTimeController: UnableToCreditTimeController
  const page = createMock<UnableToCreditTimePage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    unableToCreditTimeController = new UnableToCreditTimeController(
      page,
      courseCompletionService,
      formService,
      offenderService,
    )
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    offenderService.getOffenderSummary.mockResolvedValue(offenderResponse)
    page.validationErrors.mockReturnValue(errorResponse)
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

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: {}, body: {} })

      const requestHandler = unableToCreditTimeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
      expect(formService.getForm).not.toHaveBeenCalled()
    })

    it('fetches form data if form param exists', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = unableToCreditTimeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('saves resolution and redirects to the index page', async () => {
      const resolution = courseCompletionResolutionFactory.build()
      const successMessage = 'Success'
      page.requestBody.mockReturnValue(resolution)
      page.successMessage.mockReturnValue(successMessage)
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1', form: '2' } })

      const requestHandler = unableToCreditTimeController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.courseCompletions.index({}))
      expect(courseCompletionService.saveResolution).toHaveBeenCalledWith({ id: '1', username }, resolution)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
    })

    it('renders the show page with errors when validation fails', async () => {
      const unableToCreditTimeNotes = 'notes'
      const errorSummary = [
        {
          text: 'Error',
          href: '#input',
        },
      ] as ErrorUtils.ErrorSummaryItem[]

      const errors = {
        unableToCreditTimeNotes: { text: 'Error' },
      }

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimeNotes,
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.validationErrors.mockReturnValue({
        hasErrors: true,
        errorSummary,
        errors,
      })

      const resolution = courseCompletionResolutionFactory.build()
      const successMessage = 'Success'
      page.requestBody.mockReturnValue(resolution)
      page.successMessage.mockReturnValue(successMessage)
      const request: DeepMocked<Request> = createMock<Request>({
        params: { id: '1', form: '2' },
        query: { unableToCreditTimeNotes },
      })

      const requestHandler = unableToCreditTimeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, errorSummary, errors })
    })

    it('calls catchApiValidationErrorOrPropagate when saveResolution throws a SanitisedError', async () => {
      jest.spyOn(ErrorUtils, 'catchApiValidationErrorOrPropagate')
      const resolution = courseCompletionResolutionFactory.build()
      const error: SanitisedError = {
        name: 'SanitisedError',
        message: 'API error',
        responseStatus: 400,
        data: {
          userMessage: 'An error occurred',
          developerMessage: 'Developer message',
          status: 400,
        },
      }

      page.requestBody.mockReturnValue(resolution)
      const path = '/path'
      page.updatePath.mockReturnValue(path)
      courseCompletionService.saveResolution.mockRejectedValue(error)

      const request = createMock<Request>({ params: { id: '1', form: '2' } })

      const requestHandler = unableToCreditTimeController.submit()
      await requestHandler(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, path)
    })
  })
})
