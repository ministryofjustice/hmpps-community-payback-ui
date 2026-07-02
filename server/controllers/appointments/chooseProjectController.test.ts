import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ChooseProjectController from './chooseProjectController'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ProviderService from '../../services/providerService'
import ProjectService from '../../services/projectService'
import SessionService from '../../services/sessionService'
import ChooseProjectPage from '../../pages/appointments/chooseProjectPage'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import getProjectsAndTeams from '../shared/getProjectsAndTeams'
import projectFactory from '../../testutils/factories/projectFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { ErrorSummaryItem } from '../../utils/errorUtils'

jest.mock('../../pages/appointments/chooseProjectPage')
jest.mock('../shared/getAppointmentOrSession')
jest.mock('../shared/getProjectsAndTeams')
jest.mock('../shared/getTeams')

describe('ChooseProjectController', () => {
  const username = 'user'
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const chooseProjectPageMock: jest.Mock = ChooseProjectPage as unknown as jest.Mock<ChooseProjectPage>
  const getAppointmentOrSessionMock: jest.Mock = getAppointmentOrSession as unknown as jest.Mock
  const getProjectsAndTeamsMock: jest.Mock = getProjectsAndTeams as unknown as jest.Mock

  const appointmentService = createMock<AppointmentService>()
  const appointmentFormService = createMock<AppointmentFormService>()
  const providerService = createMock<ProviderService>()
  const projectService = createMock<ProjectService>()
  const sessionService = createMock<SessionService>()

  const project = projectFactory.build({
    projectType: { group: 'GROUP' },
  })

  let controller: ChooseProjectController

  let mockPageInstance: {
    validationErrors: jest.Mock
    updateForm: jest.Mock
    next: jest.Mock
    commonViewData: jest.Mock
  }

  beforeEach(() => {
    jest.resetAllMocks()

    mockPageInstance = {
      validationErrors: jest.fn().mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] }),
      updateForm: jest.fn(),
      next: jest.fn(),
      commonViewData: jest.fn().mockReturnValue({ common: 'value' }),
    }

    chooseProjectPageMock.mockReturnValue(mockPageInstance)

    controller = new ChooseProjectController(
      appointmentService,
      appointmentFormService,
      providerService,
      projectService,
      sessionService,
    )

    projectService.getProject.mockResolvedValue(project)

    getAppointmentOrSessionMock.mockResolvedValue(appointmentFactory.build())
    getProjectsAndTeamsMock.mockReturnValue({
      teamItems: [{ value: 'T1', text: 'Team 1' }],
      projectItems: [{ value: 'PR1', text: 'Project 1' }],
    })
  })

  describe('show', () => {
    it('renders page with teamCode from query', async () => {
      const request = createMock<Request>({
        params: { projectCode: 'PROJECT-1', appointmentId: '1' },
        method: 'GET',
        query: { team: 'QUERY-TEAM' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const form = appointmentOutcomeFormFactory.build({
        projectTeam: { code: 'FORM-TEAM' },
        project: { code: 'Project' },
      })
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          teamCode: 'QUERY-TEAM',
          projectCode: 'Project',
        }),
      )
    })

    it('renders page with teamCode and projectCode from form', async () => {
      const request = createMock<Request>({
        params: { projectCode: 'PROJECT-1', appointmentId: '1' },
        method: 'GET',
        query: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const form = appointmentOutcomeFormFactory.build({
        projectTeam: { code: 'FORM-TEAM' },
        project: { code: 'FORM-PROJECT', name: 'name' },
      })
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          teamCode: 'FORM-TEAM',
          projectCode: 'FORM-PROJECT',
        }),
      )
    })
  })

  describe('submit', () => {
    it('renders page with errors', async () => {
      const request = createMock<Request>({
        params: { projectCode: 'PROJECT-1', appointmentId: '1' },
        body: { team: 'TEAM-1', project: 'PROJECT-2' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })
      const form = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)

      const validationErrors = {
        hasErrors: true,
        errors: { project: { text: 'Select a project' } },
        errorSummary: [{ text: 'Select a project', href: '#project' }],
      }

      mockPageInstance.validationErrors.mockReturnValue(validationErrors)

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          teamCode: 'TEAM-1',
          projectCode: 'PROJECT-2',
        }),
      )
      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseProject', {
        teamItems: [{ value: 'T1', text: 'Team 1' }],
        projectItems: [{ value: 'PR1', text: 'Project 1' }],
        errors: validationErrors.errors,
        errorSummary: validationErrors.errorSummary,
      })
      expect(appointmentFormService.saveForm).not.toHaveBeenCalled()
      expect(response.redirect).not.toHaveBeenCalled()
    })

    it('saves form and redirects if no errors', async () => {
      const request = createMock<Request>({
        params: { projectCode: 'PROJECT-1', appointmentId: '1' },
        query: {},
        body: { team: 'TEAM-1', project: 'PROJECT-2', form: 'form-1' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })
      const form = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)

      const updatedForm = appointmentOutcomeFormFactory.build()

      mockPageInstance.validationErrors.mockReturnValue({
        hasErrors: false,
        errors: {},
        errorSummary: [] as Array<ErrorSummaryItem>,
      })
      mockPageInstance.updateForm.mockReturnValue(updatedForm)
      mockPageInstance.next.mockReturnValue('/next')

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith({
        projectCode: 'PROJECT-2',
        projectService,
        providerService,
        projectTypeGroup: project.projectType.group,
        providerCode: project.providerCode,
        teamCode: 'TEAM-1',
        response,
        project,
      })

      expect(appointmentFormService.saveForm).toHaveBeenCalledWith('form-1', username, updatedForm)
      expect(response.redirect).toHaveBeenCalledWith('/next')
      expect(response.render).not.toHaveBeenCalled()
    })
  })
})
