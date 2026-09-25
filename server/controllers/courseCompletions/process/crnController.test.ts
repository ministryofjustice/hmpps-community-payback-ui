import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CrnController from './crnController'
import CourseCompletionService from '../../../services/courseCompletionService'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import AuditService from '../../../services/auditService'
import * as Utils from '../../../utils/utils'

describe('CrnController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = 'courseCompletions/process/crn'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const auditService = createMock<AuditService>()

  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()

  const courseCompletionShowPath = '/course-completion/show'
  const resultPathWithCrn = '/result/path/:crn'

  let crnController: CrnController
  const page = createMock<CrnPage>()

  beforeEach(() => {
    jest.resetAllMocks()
    crnController = new CrnController(page, courseCompletionService, formService, auditService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    jest.spyOn(Utils, 'pathWithQuery').mockImplementation(path => {
      return /check/.test(path) ? resultPathWithCrn : courseCompletionShowPath
    })
  })

  describe('show', () => {
    it('should render the page', async () => {
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = crnController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        resultPath: resultPathWithCrn,
        backLink: courseCompletionShowPath,
      })
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request: DeepMocked<Request> = createMock<Request>({
        params: { id: '1', crn: '1234' },
        query: { form: '12' },
      })

      const requestHandler = crnController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
      expect(formService.getForm).toHaveBeenCalled()
      expect(formService.saveForm).toHaveBeenCalled()
    })
  })
})
