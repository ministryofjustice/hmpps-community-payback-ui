import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ConfirmController from './confirmController'
import CourseCompletionService from '../../../services/courseCompletionService'
import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import providerTeamSummaryFactory from '../../../testutils/factories/providerTeamSummaryFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import OffenderService from '../../../services/offenderService'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import GovUkRadioGroup from '../../../forms/GovUkRadioGroup'
import paths from '../../../paths'
import courseCompletionResolutionFactory from '../../../testutils/factories/courseCompletionResolutionFactory'

describe('ConfirmController', () => {
  const username = 'username'
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const providerService = createMock<ProviderService>()
  const projectService = createMock<ProjectService>()
  const offenderService = createMock<OffenderService>()

  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const teamsResponse = { providers: providerTeamSummaryFactory.buildList(2) }
  const projectsResponse = pagedModelProjectOutcomeSummaryFactory.build()
  const offenderResponse = caseDetailsSummaryFactory.build()

  let confirmController: ConfirmController
  const page = createMock<ConfirmPage>({ templatePath })

  beforeEach(() => {
    jest.resetAllMocks()
    confirmController = new ConfirmController(
      page,
      courseCompletionService,
      formService,
      providerService,
      projectService,
      offenderService,
    )
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    providerService.getTeams.mockResolvedValue(teamsResponse)
    projectService.getProjects.mockResolvedValue(projectsResponse)
    offenderService.getOffenderSummary.mockResolvedValue(offenderResponse)
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

      const personItems = [
        { key: { text: 'CRN' }, value: { text: 'some crn' } },
        { key: { text: 'Requirement' }, value: { text: 'requirement data' } },
      ]

      const appointmentItems = [
        { key: { text: 'Project team' }, value: { text: 'Some project team' } },
        { key: { text: 'Project' }, value: { text: 'Some project' } },
      ]
      page.personItems.mockReturnValue(personItems)
      page.appointmentItems.mockReturnValue(appointmentItems)

      const alertPractitionerItems = [{ text: 'Yes', value: 'yes' }]
      jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(alertPractitionerItems)

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query: { form: '12' } })

      const requestHandler = confirmController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        personItems,
        appointmentItems,
        alertPractitionerItems,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('saves course completion and redirects to the index page', async () => {
      const resolution = courseCompletionResolutionFactory.build()
      const successMessage = 'Success'
      page.requestBody.mockReturnValue(resolution)
      page.successMessage.mockReturnValue(successMessage)
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.courseCompletions.index({}))
      expect(courseCompletionService.saveResolution).toHaveBeenCalledWith({ id: '1', username }, resolution)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
    })
  })
})
