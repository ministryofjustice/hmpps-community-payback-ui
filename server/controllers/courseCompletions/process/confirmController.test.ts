import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
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
import * as ErrorUtils from '../../../utils/errorUtils'
import AppointmentService from '../../../services/appointmentService'
import pagedModelAppointmentSummaryFactory from '../../../testutils/factories/pagedModelAppointmentSummaryFactory'
import { pathWithQuery } from '../../../utils/utils'

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
  const appointmentService = createMock<AppointmentService>()

  const courseCompletion = courseCompletionFactory.build()
  let form = courseCompletionFormFactory.build()
  const teamsResponse = { providers: providerTeamSummaryFactory.buildList(2) }
  const projectsResponse = pagedModelProjectOutcomeSummaryFactory.build()
  const offenderResponse = caseDetailsSummaryFactory.build()
  const appointmentResponse = pagedModelAppointmentSummaryFactory.build()

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
      appointmentService,
    )
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue(form)
    providerService.getTeams.mockResolvedValue(teamsResponse)
    projectService.getProjects.mockResolvedValue(projectsResponse)
    offenderService.getOffenderSummary.mockResolvedValue(offenderResponse)
    appointmentService.getAppointments.mockResolvedValue(appointmentResponse)
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

    it('should render the page with errorList when errorMessages are present', async () => {
      const errorMessages = ['Project team is required', 'Project is required']
      const responseWithErrors = createMock<Response>({
        locals: { user: { username }, errorMessages },
      })

      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' } })

      const requestHandler = confirmController.show()
      await requestHandler(request, responseWithErrors, next)

      const expectedErrorList = [{ text: 'Project team is required' }, { text: 'Project is required' }]

      expect(responseWithErrors.render).toHaveBeenCalledWith(
        templatePath,
        expect.objectContaining({ errorList: expectedErrorList }),
      )
    })
  })

  describe('submit', () => {
    it('saves course completion and redirects to the search page', async () => {
      const resolution = courseCompletionResolutionFactory.build()
      const successMessage = 'Success'
      page.requestBody.mockReturnValue(resolution)
      page.successMessage.mockReturnValue(successMessage)
      const query = { pdu: '2', form: '1' }
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        pathWithQuery(paths.courseCompletions.search({}), form.originalSearch),
      )
      expect(courseCompletionService.saveResolution).toHaveBeenCalledWith({ id: '1', username }, resolution)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
    })

    it('redirects to the index page if no original search', async () => {
      const resolution = courseCompletionResolutionFactory.build()
      form = courseCompletionFormFactory.build({ originalSearch: undefined })
      formService.getForm.mockResolvedValue(form)
      const successMessage = 'Success'
      page.requestBody.mockReturnValue(resolution)
      page.successMessage.mockReturnValue(successMessage)
      const query = { pdu: '2', form: '1' }
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.courseCompletions.index({}))
      expect(courseCompletionService.saveResolution).toHaveBeenCalledWith({ id: '1', username }, resolution)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
    })

    it('redirects to the index page if no original search properties', async () => {
      const resolution = courseCompletionResolutionFactory.build()
      form = { originalSearch: {} }
      formService.getForm.mockResolvedValue(form)
      const successMessage = 'Success'
      page.requestBody.mockReturnValue(resolution)
      page.successMessage.mockReturnValue(successMessage)
      const query = { pdu: '2', form: '1' }
      const request: DeepMocked<Request> = createMock<Request>({ params: { id: '1' }, query })

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.courseCompletions.index({}))
      expect(courseCompletionService.saveResolution).toHaveBeenCalledWith({ id: '1', username }, resolution)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
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

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, path)
    })
  })
})
