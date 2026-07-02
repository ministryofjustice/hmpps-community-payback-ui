import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ProjectController from './projectController'
import CourseCompletionService from '../../../services/courseCompletionService'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import AuditService from '../../../services/auditService'
import getProjectsAndTeams from '../../shared/getProjectsAndTeams'

jest.mock('../../shared/getProjectsAndTeams')

describe('ProjectController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const providerService = createMock<ProviderService>()
  const projectService = createMock<ProjectService>()
  const auditService = createMock<AuditService>()

  const courseCompletion = courseCompletionFactory.build()
  const { providerCode } = courseCompletion.pdu
  const form = courseCompletionFormFactory.build({ team: undefined, project: undefined })

  let projectController: ProjectController
  const page = createMock<ProjectPage>({ templatePath })

  const teamItems = [
    { text: 'Team 1', value: '1' },
    { text: 'Team 2', value: '2' },
  ]

  const getProjectsAndTeamsMock: jest.Mock = getProjectsAndTeams as unknown as jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    projectController = new ProjectController(
      page,
      courseCompletionService,
      formService,
      providerService,
      projectService,
      auditService,
    )
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    getProjectsAndTeamsMock.mockResolvedValue({ teamItems, projectItems: undefined })
  })

  describe('show', () => {
    it('should render the page', async () => {
      const formId = '12'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        teamItems,
        form: formId,
        teamCode: undefined,
        projectItems: undefined,
      })
      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith({
        projectService,
        providerService,
        projectTypeGroup: 'ETE',
        providerCode,
        teamCode: undefined,
        projectCode: undefined,
        response,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })

    it('returns selected team and projectItems if teamCode query not undefined', async () => {
      const formId = '12'
      const teamCode = '13'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      const projectItems = [
        { text: 'Project 1', value: '1' },
        { text: 'Project 2', value: '2' },
      ]
      getProjectsAndTeamsMock.mockResolvedValue({ teamItems, projectItems })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId, team: teamCode } })

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        teamItems,
        form: formId,
        projectItems,
      })
      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectService,
          providerService,
          projectTypeGroup: 'ETE',
          providerCode,
          teamCode,
          response,
        }),
      )
    })

    it('returns selected team and projectItems if teamCode on form not undefined', async () => {
      const formId = '12'
      const teamCode = '13'
      const formWithTeam = courseCompletionFormFactory.build({ team: teamCode })
      formService.getForm.mockResolvedValue(formWithTeam)

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      const projectItems = [
        { text: 'Project 1', value: '1' },
        { text: 'Project 2', value: '2' },
      ]
      getProjectsAndTeamsMock.mockResolvedValue({ teamItems, projectItems, teamCode })
      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        teamItems,
        form: formId,
        teamCode,
        projectItems,
      })
      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectService,
          providerService,
          projectTypeGroup: 'ETE',
          providerCode,
          teamCode,
          response,
        }),
      )
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

    describe('has validation errors', () => {
      it('rerenders page', async () => {
        const formId = '12'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
          unableToCreditTimePath: '/unable-to-credit-time',
        }
        page.viewData.mockReturnValue(viewData)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { project: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

        const requestHandler = projectController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          teamItems,
          errors,
          errorSummary,
          form: formId,
          teamCode: undefined,
          projectItems: undefined,
        })
        expect(getProjectsAndTeamsMock).toHaveBeenCalledWith({
          projectService,
          providerService,
          projectTypeGroup: 'ETE',
          providerCode,
          teamCode: undefined,
          projectCode: undefined,
          response,
        })
        expect(formService.getForm).toHaveBeenCalledTimes(1)
      })

      it('returns projectItems if teamCode body property not undefined', async () => {
        const formId = '12'
        const teamCode = '13'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
          unableToCreditTimePath: '/unable-to-credit-time',
        }
        page.viewData.mockReturnValue(viewData)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { project: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })
        const projectItems = [
          { text: 'Project 1', value: '1' },
          { text: 'Project 2', value: '2' },
        ]
        getProjectsAndTeamsMock.mockResolvedValue({ teamItems, projectItems, teamCode })

        const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: { team: teamCode } })

        const requestHandler = projectController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          teamItems,
          form: formId,
          teamCode,
          errors,
          errorSummary,
          projectItems,
        })
        expect(getProjectsAndTeamsMock).toHaveBeenCalledWith({
          projectService,
          providerService,
          projectTypeGroup: 'ETE',
          providerCode,
          teamCode,
          projectCode: undefined,
          response,
        })
      })

      it('populates project code if project provided on body', async () => {
        const formId = '12'
        const teamCode = '13'
        const projectCode = '14'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
          unableToCreditTimePath: '/unable-to-credit-time',
        }
        page.viewData.mockReturnValue(viewData)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { project: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })
        const projectItems = [
          { text: 'Project 1', value: '1' },
          { text: 'Project 2', value: '2' },
        ]
        getProjectsAndTeamsMock.mockResolvedValue({ teamItems, projectItems, teamCode })

        const request = createMock<Request>({
          params: { id: '1' },
          query: { form: formId },
          body: { team: teamCode, project: projectCode },
        })

        const requestHandler = projectController.submit()
        await requestHandler(request, response, next)
        expect(getProjectsAndTeamsMock).toHaveBeenCalledWith({
          projectService,
          providerService,
          projectTypeGroup: 'ETE',
          providerCode,
          teamCode,
          projectCode,
          response,
        })
      })
    })
  })
})
