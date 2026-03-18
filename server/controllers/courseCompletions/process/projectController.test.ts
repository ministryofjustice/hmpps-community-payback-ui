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
import ProjectService from '../../../services/projectService'
import pagedModelProjectOutcomeSummaryFactory from '../../../testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import GovUkSelectInput from '../../../forms/GovUkSelectInput'

jest.mock('../../shared/getTeams')

describe('ProjectController', () => {
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const providerService = createMock<ProviderService>()
  const projectService = createMock<ProjectService>()
  const courseCompletion = courseCompletionFactory.build()
  const { providerCode } = courseCompletion.pdu
  const form = courseCompletionFormFactory.build({ team: undefined, project: undefined })

  let projectController: ProjectController
  const page = createMock<ProjectPage>({ templatePath })

  const teamItems = [
    { text: 'Team 1', value: '1' },
    { text: 'Team 2', value: '2' },
  ]

  const getTeamsMock: jest.Mock = getTeams as unknown as jest.Mock<Promise<Array<GovUkSelectOption>>>

  beforeEach(() => {
    jest.resetAllMocks()
    projectController = new ProjectController(
      page,
      courseCompletionService,
      formService,
      providerService,
      projectService,
    )
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    getTeamsMock.mockResolvedValue(teamItems)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const showPath = '/show'
      const formId = '12'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        teamItems,
        form: formId,
        showPath,
        teamCode: undefined,
        projectItems: undefined,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })

    it('returns selected team and projectItems if teamCode query not undefined', async () => {
      const showPath = '/show'
      const formId = '12'
      const teamCode = '13'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId, team: teamCode } })

      const projects = pagedModelProjectOutcomeSummaryFactory.build()
      projectService.getProjects.mockResolvedValue(projects)

      const projectItems = [
        { text: 'Project 1', value: '1' },
        { text: 'Project 2', value: '2' },
      ]

      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(projectItems)

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        teamItems,
        form: formId,
        showPath,
        teamCode,
        projectItems,
      })

      expect(getTeams).toHaveBeenCalledWith({ providerService, response, teamCode, providerCode })
    })

    it('returns selected team and projectItems if teamCode on form not undefined', async () => {
      const showPath = '/show'
      const formId = '12'
      const teamCode = '13'
      const formWithTeam = courseCompletionFormFactory.build({ team: teamCode })
      formService.getForm.mockResolvedValue(formWithTeam)

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)
      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

      const projects = pagedModelProjectOutcomeSummaryFactory.build()
      projectService.getProjects.mockResolvedValue(projects)

      const projectItems = [
        { text: 'Project 1', value: '1' },
        { text: 'Project 2', value: '2' },
      ]

      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(projectItems)

      const requestHandler = projectController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        teamItems,
        form: formId,
        showPath,
        teamCode,
        projectItems,
      })

      expect(getTeams).toHaveBeenCalledWith({ providerService, response, teamCode, providerCode })
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
        const showPath = '/show'
        const formId = '12'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.updatePath.mockReturnValue(showPath)

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
          showPath,
          teamCode: undefined,
          projectItems: undefined,
        })
        expect(formService.getForm).toHaveBeenCalledTimes(1)
      })

      it('returns projectItems if teamCode body property not undefined', async () => {
        const showPath = '/show'
        const formId = '12'
        const teamCode = '13'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.updatePath.mockReturnValue(showPath)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { project: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: { team: teamCode } })

        const projects = pagedModelProjectOutcomeSummaryFactory.build()
        projectService.getProjects.mockResolvedValue(projects)

        const projectItems = [
          { text: 'Project 1', value: '1' },
          { text: 'Project 2', value: '2' },
        ]

        jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(projectItems)

        const requestHandler = projectController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          teamItems,
          form: formId,
          showPath,
          teamCode,
          errors,
          errorSummary,
          projectItems,
        })

        expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
          projects.content,
          'projectName',
          'projectCode',
          'Choose project',
          undefined,
        )
      })

      it('populates project code if project provided on body', async () => {
        const showPath = '/show'
        const formId = '12'
        const teamCode = '13'
        const projectCode = '14'
        const viewData = {
          backLink: '/back',
          updatePath: '/update',
          communityCampusPerson: { name: 'Mary Smith' },
          courseName: 'Customer service',
        }
        page.viewData.mockReturnValue(viewData)
        page.updatePath.mockReturnValue(showPath)

        const errorSummary = [
          { text: 'Error 1', href: '#1', attributes: {} },
          { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
        ]
        const errors = { project: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const request = createMock<Request>({
          params: { id: '1' },
          query: { form: formId },
          body: { team: teamCode, project: projectCode },
        })

        const projects = pagedModelProjectOutcomeSummaryFactory.build()
        projectService.getProjects.mockResolvedValue(projects)

        const projectItems = [
          { text: 'Project 1', value: '1' },
          { text: 'Project 2', value: '2' },
        ]

        jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(projectItems)

        const requestHandler = projectController.submit()
        await requestHandler(request, response, next)

        expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
          projects.content,
          'projectName',
          'projectCode',
          'Choose project',
          projectCode,
        )
      })
    })
  })
})
