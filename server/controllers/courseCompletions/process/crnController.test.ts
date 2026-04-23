import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CrnController from './crnController'
import CourseCompletionService from '../../../services/courseCompletionService'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import OffenderService from '../../../services/offenderService'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'

describe('CrnController', () => {
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
    crn: '123',
    hintText: 'hint',
  }

  let crnController: CrnController
  const page = createMock<CrnPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    crnController = new CrnController(page, courseCompletionService, formService, offenderService)
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
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue(stepViewData)

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: {} })

      const requestHandler = crnController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, ...stepViewData })
      expect(formService.getForm).not.toHaveBeenCalled()
    })

    it('fetches form data if form param', async () => {
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)
      page.stepViewData.mockReturnValue(stepViewData)

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = crnController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, ...stepViewData })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    describe('no errors', () => {
      it('redirects to the next page', async () => {
        const nextPath = '/next'
        page.nextPath.mockReturnValue(nextPath)
        page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

        const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: {} })

        const requestHandler = crnController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
        expect(formService.getForm).not.toHaveBeenCalled()
        expect(formService.saveForm).toHaveBeenCalled()
      })

      it('fetches form data if form param', async () => {
        const nextPath = '/next'
        page.nextPath.mockReturnValue(nextPath)
        page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

        const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

        const requestHandler = crnController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
        expect(formService.getForm).toHaveBeenCalledTimes(1)
        expect(formService.saveForm).toHaveBeenCalled()
      })
    })

    describe('has validation errors', () => {
      it('rerenders page if validation errors', async () => {
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.stepViewData.mockReturnValue(stepViewData)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { crn: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const request = createMock<Request>({ params: { id: '1' }, query: {} })

        const requestHandler = crnController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          ...stepViewData,
          errors,
          errorSummary,
        })
        expect(formService.getForm).not.toHaveBeenCalled()
      })

      it('fetches form data if form param', async () => {
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.stepViewData.mockReturnValue(stepViewData)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { crn: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

        const requestHandler = crnController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          ...stepViewData,
          errors,
          errorSummary,
        })
        expect(formService.getForm).toHaveBeenCalledTimes(1)
      })
    })

    describe('has API errors', () => {
      describe('when the error status is 404', () => {
        it('rerenders the page with errors', async () => {
          offenderService.getOffenderSummary.mockRejectedValue({
            responseStatus: 404,
          })

          const viewData = {
            backLink: '/back',
            updatePath: '/update',
            communityCampusPerson: { name: 'Mary Smith' },
            courseName: 'Customer service',
          }
          page.viewData.mockReturnValue(viewData)
          page.stepViewData.mockReturnValue(stepViewData)

          const crnNotFoundErrors = {
            errorSummary: [{ text: 'Error 1', href: '#1', attributes: {} }],
            errors: { crn: { text: 'Error' } },
          }

          page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
          page.getCrnNotFoundErrors.mockReturnValue(crnNotFoundErrors)

          const request = createMock<Request>({ params: { id: '1' }, query: {} })

          const requestHandler = crnController.submit()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(templatePath, {
            ...viewData,
            ...stepViewData,
            ...crnNotFoundErrors,
          })
          expect(formService.saveForm).not.toHaveBeenCalled()
        })
      })

      describe('when the error status is not 404', () => {
        it('throws the error', async () => {
          const apiError = {
            responseStatus: 500,
          }

          offenderService.getOffenderSummary.mockRejectedValue(apiError)

          page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

          const request = createMock<Request>({ params: { id: '1' }, query: {} })

          const requestHandler = crnController.submit()
          await expect(requestHandler(request, response, next)).rejects.toEqual(apiError)
        })
      })
    })
  })
})
