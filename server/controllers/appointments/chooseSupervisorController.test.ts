import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import projectFactory from '../../testutils/factories/projectFactory'
import providerTeamSummaryFactory from '../../testutils/factories/providerTeamSummaryFactory'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import ChooseSupervisorController from './chooseSupervisorController'
import ProjectService from '../../services/projectService'
import SessionService from '../../services/sessionService'

jest.mock('../../pages/appointments/chooseSupervisorPage')

describe('ChooseSupervisorController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const projectCode = '2'
  const providerCode = 'PROV123'
  const team = 'X123'
  const formId = '123'
  const request = createMock<Request>({ params: { appointmentId, projectCode }, query: { team, form: formId } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const chooseSupervisorPageMock: jest.Mock = ChooseSupervisorPage as unknown as jest.Mock<ChooseSupervisorPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let appointmentsController: ChooseSupervisorController
  const appointmentService = createMock<AppointmentService>()
  const providerDataService = createMock<ProviderService>()
  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const sessionService = createMock<SessionService>()

  let mockPageInstance: {
    validationErrors: jest.Mock
    commonViewData: jest.Mock
    viewData: jest.Mock
    next: jest.Mock
    updateForm: jest.Mock
    updatePath: jest.Mock
  }

  beforeEach(() => {
    jest.resetAllMocks()

    mockPageInstance = {
      validationErrors: jest.fn().mockReturnValue({
        hasErrors: false,
        errors: {},
        errorSummary: [],
      }),
      commonViewData: jest.fn().mockReturnValue(pageViewData),
      viewData: jest.fn().mockReturnValue(pageViewData),
      next: jest.fn(),
      updateForm: jest.fn(),
      updatePath: jest.fn().mockReturnValue('/update-path'),
    }

    chooseSupervisorPageMock.mockReturnValue(mockPageInstance)

    appointmentsController = new ChooseSupervisorController(
      appointmentService,
      formService,
      providerDataService,
      projectService,
      sessionService,
    )
  })

  describe('show', () => {
    it('should render the choose supervisor page', async () => {
      const appointment = appointmentFactory.build()
      const project = projectFactory.build({ projectCode, providerCode })
      const teams = providerTeamSummaryFactory.buildList(2)
      const supervisors = supervisorSummaryFactory.buildList(2)

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)
      providerDataService.getTeams.mockResolvedValue({ providers: teams })
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining(pageViewData),
      )
    })

    it('should fetch the in progress form if it exists', async () => {
      const form = appointmentOutcomeFormFactory.build()
      const appointment = appointmentFactory.build()
      const project = projectFactory.build({ projectCode, providerCode })
      const teams = providerTeamSummaryFactory.buildList(2)
      const supervisors = supervisorSummaryFactory.buildList(2)

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)
      formService.getForm.mockResolvedValue(form)
      providerDataService.getTeams.mockResolvedValue({ providers: teams })
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.show()
      await requestHandler(request, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining(pageViewData),
      )
    })
  })

  describe('submit', () => {
    it('should render the choose supervisor page with errors', async () => {
      const errors = { team: { text: 'Select a team' } }
      const errorSummary = [{ text: 'Select a team', href: '#team' }]

      mockPageInstance.validationErrors.mockReturnValue({
        hasErrors: true,
        errors,
        errorSummary,
      })

      const appointment = appointmentFactory.build()
      const project = projectFactory.build({ projectCode, providerCode })
      const teams = providerTeamSummaryFactory.buildList(2)
      const form = appointmentOutcomeFormFactory.build()

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)
      formService.getForm.mockResolvedValue(form)
      providerDataService.getTeams.mockResolvedValue({ providers: teams })

      const requestHandler = appointmentsController.submit()

      const submitRequest = createMock<Request>({
        params: { appointmentId: '1' },
        body: { form: formId },
      })

      await requestHandler(submitRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining({
          errors,
          errorSummary,
        }),
      )
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/nextPath'
      const formToSave = { supervisor: { code: 'SUP123' } }
      const submitRequest = createMock<Request>({
        ...request,
        body: { form: formId, team, supervisor: 'SUP123' },
      })

      beforeEach(() => {
        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: false,
          errors: {},
          errorSummary: [],
        })
        mockPageInstance.next.mockReturnValue(nextPath)
        mockPageInstance.updateForm.mockReturnValue(formToSave)
      })

      it('should redirect to the next page', async () => {
        const appointment = appointmentFactory.build()
        const project = projectFactory.build({ projectCode, providerCode })
        const teams = providerTeamSummaryFactory.buildList(2)
        const supervisors = supervisorSummaryFactory.buildList(2)
        const form = appointmentOutcomeFormFactory.build()

        appointmentService.getAppointment.mockResolvedValue(appointment)
        projectService.getProject.mockResolvedValue(project)
        formService.getForm.mockResolvedValue(form)
        providerDataService.getTeams.mockResolvedValue({ providers: teams })
        providerDataService.getSupervisors.mockResolvedValue(supervisors)

        const requestHandler = appointmentsController.submit()

        await requestHandler(submitRequest, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = appointmentOutcomeFormFactory.build()
        const appointment = appointmentFactory.build()
        const project = projectFactory.build({ projectCode, providerCode })
        const teams = providerTeamSummaryFactory.buildList(2)
        const supervisors = supervisorSummaryFactory.buildList(2)

        appointmentService.getAppointment.mockResolvedValue(appointment)
        projectService.getProject.mockResolvedValue(project)
        formService.getForm.mockResolvedValue(existingForm)
        providerDataService.getTeams.mockResolvedValue({ providers: teams })
        providerDataService.getSupervisors.mockResolvedValue(supervisors)

        const requestHandler = appointmentsController.submit()

        await requestHandler(submitRequest, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
