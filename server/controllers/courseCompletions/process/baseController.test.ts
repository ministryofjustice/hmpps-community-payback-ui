import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import BaseController, { StepViewDataParams } from './baseController'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

class TestController extends BaseController<AppointmentPage> {
  protected override async getStepViewData({ req, formData }: StepViewDataParams) {
    const team = this.getPropertyValue({ propertyName: 'team', req, formData })
    return Promise.resolve({ team })
  }
}

describe('BaseController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const courseCompletionFormService = createMock<CourseCompletionFormService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build({ team: undefined })

  let testController: TestController
  const page = createMock<AppointmentPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    testController = new TestController(page, courseCompletionService, courseCompletionFormService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    courseCompletionFormService.getForm.mockResolvedValue(form)
  })

  describe('getPropertyValue', () => {
    describe('show', () => {
      it('should render page with undefined team if no team value provided', async () => {
        const showPath = '/show'
        const formId = '12'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'John Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.updatePath.mockReturnValue(showPath)

        const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

        const requestHandler = testController.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          team: undefined,
        })
      })

      it.each(['', 'value'])('should render page with team from query string', async (team?: string) => {
        const showPath = '/show'
        const formId = '12'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'John Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.updatePath.mockReturnValue(showPath)

        const request = createMock<Request>({
          params: { id: '1' },
          query: { form: formId, team },
          body: {},
        })

        const requestHandler = testController.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          team,
        })
      })

      it.each(['', 'value'])(
        'should render page with team from formData if team on body has no value',
        async (team: string) => {
          const showPath = '/show'
          const formId = '12'
          const formWithTeam = courseCompletionFormFactory.build({ team })
          courseCompletionFormService.getForm.mockResolvedValue(formWithTeam)

          const viewData = {
            backLink: '/back',
            updatePath: '/update',
            courseName: 'Customer service',
            communityCampusPerson: { name: 'John Smith' },
          }
          page.viewData.mockReturnValue(viewData)
          page.updatePath.mockReturnValue(showPath)

          const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

          const requestHandler = testController.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(templatePath, {
            ...viewData,
            team,
          })
        },
      )
    })

    describe('submit', () => {
      it.each(['', 'value'])('should pass team from body on validation error', async (team: string) => {
        const showPath = '/show'
        const formId = '12'
        const viewData = {
          backLink: '/back',
          courseName: 'Customer service',
          updatePath: '/update',
          communityCampusPerson: { name: 'John Smith' },
        }
        page.viewData.mockReturnValue(viewData)
        page.updatePath.mockReturnValue(showPath)

        const errorSummary = [{ text: 'Error 1', href: '#1', attributes: {} }]
        const errors = { appointmentId: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const request = createMock<Request>({
          params: { id: '1' },
          query: { form: formId },
          body: { team },
        })

        const requestHandler = testController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          team,
          errors,
          errorSummary,
        })
      })

      it.each(['', 'value'])(
        'should pass team from formData on validation error when body is undefined',
        async (team: string) => {
          const showPath = '/show'
          const formId = '12'
          const formWithTeam = courseCompletionFormFactory.build({ team })
          courseCompletionFormService.getForm.mockResolvedValue(formWithTeam)

          const viewData = {
            courseName: 'Customer service',
            backLink: '/back',
            updatePath: '/update',
            communityCampusPerson: { name: 'John Smith' },
          }
          page.viewData.mockReturnValue(viewData)
          page.updatePath.mockReturnValue(showPath)

          const errorSummary = [{ text: 'Error 1', href: '#1', attributes: {} }]
          const errors = { appointmentId: { text: 'Error' } }
          page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

          const request = createMock<Request>({
            params: { id: '1' },
            query: { form: formId },
            body: {},
          })

          const requestHandler = testController.submit()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(templatePath, {
            ...viewData,
            team,
            errors,
            errorSummary,
          })
        },
      )
    })
  })
})
