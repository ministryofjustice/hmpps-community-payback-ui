import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ProjectController from './projectController'
import CourseCompletionService from '../../../services/courseCompletionService'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import ProviderService from '../../../services/providerService'
import { GovUkSelectOption } from '../../../@types/user-defined'
import getTeams from '../../shared/getTeams'

jest.mock('../../shared/getTeams')

describe('ProjectController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const providerService = createMock<ProviderService>()
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()

  let projectController: ProjectController
  const page = createMock<ProjectPage>({ templatePath })

  const teamItems = [
    { text: 'Team 1', value: '1' },
    { text: 'Team 2', value: '2' },
  ]

  const getTeamsMock: jest.Mock = getTeams as unknown as jest.Mock<Promise<Array<GovUkSelectOption>>>

  beforeEach(() => {
    jest.resetAllMocks()
    projectController = new ProjectController(page, courseCompletionService, formService, providerService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    getTeamsMock.mockResolvedValue(teamItems)
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

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, teamItems })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = projectController.submit()
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
      const errors = { projectCode: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = projectController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, { ...viewData, teamItems, errors, errorSummary })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })
})
