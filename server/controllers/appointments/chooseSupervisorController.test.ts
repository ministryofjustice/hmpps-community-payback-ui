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
  const projectCode = 'PC123'
  const providerCode = 'PROV123'
  const team = 'X123'

  const request = createMock<Request>({ params: { appointmentId, projectCode }, query: { team } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const chooseSupervisorPageMock: jest.Mock = ChooseSupervisorPage as unknown as jest.Mock<ChooseSupervisorPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let controller: ChooseSupervisorController
  const appointmentService = createMock<AppointmentService>()
  const providerService = createMock<ProviderService>()
  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const sessionService = createMock<SessionService>()

  let mockPageInstance: {
    validationErrors: jest.Mock
    headingViewData: jest.Mock
    paths: jest.Mock
    selectedPeopleCard: jest.Mock
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
      headingViewData: jest.fn().mockReturnValue({ title: 'Test', caption: 'Test' }),
      paths: jest.fn().mockReturnValue({ backLink: '/back', updatePath: '/update' }),
      selectedPeopleCard: jest.fn().mockReturnValue(undefined),
      viewData: jest.fn().mockReturnValue(pageViewData),
      next: jest.fn(),
      updateForm: jest.fn(),
      updatePath: jest.fn().mockReturnValue('/update-path'),
    }

    chooseSupervisorPageMock.mockReturnValue(mockPageInstance)

    controller = new ChooseSupervisorController(
      appointmentService,
      formService,
      providerService,
      projectService,
      sessionService,
    )
  })

  describe('showSingle', () => {
    it('should render the choose supervisor page', async () => {
      const appointment = appointmentFactory.build()
      const project = projectFactory.build({ projectCode, providerCode })
      const teams = providerTeamSummaryFactory.buildList(2)
      const supervisors = supervisorSummaryFactory.buildList(2)

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)
      providerService.getTeams.mockResolvedValue({ providers: teams })
      providerService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = controller.showSingle()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining(pageViewData),
      )
    })

    it('should fetch the in progress form if it exists', async () => {
      const formId = '123'
      const form = appointmentOutcomeFormFactory.build()
      const appointment = appointmentFactory.build()
      const project = projectFactory.build({ projectCode, providerCode })
      const teams = providerTeamSummaryFactory.buildList(2)
      const supervisors = supervisorSummaryFactory.buildList(2)

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)
      formService.getForm.mockResolvedValue(form)
      providerService.getTeams.mockResolvedValue({ providers: teams })
      providerService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = controller.showSingle()
      const requestWithForm = createMock<Request>({ ...request, query: { ...request.query, form: formId } })

      await requestHandler(requestWithForm, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining(pageViewData),
      )
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
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
        providerService.getTeams.mockResolvedValue({ providers: teams })

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: 'formId123' },
        })

        await requestHandler(requestWithForm, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/chooseSupervisor',
          expect.objectContaining({
            errors,
            errorSummary,
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/next'
      const formToSave = { supervisor: { code: 'SUP123' } }
      const formId = 'formId123'

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
        providerService.getTeams.mockResolvedValue({ providers: teams })
        providerService.getSupervisors.mockResolvedValue(supervisors)

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: formId, team, supervisor: 'SUP123' },
        })

        await requestHandler(requestWithForm, response, next)

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
        providerService.getTeams.mockResolvedValue({ providers: teams })
        providerService.getSupervisors.mockResolvedValue(supervisors)

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: formId, team, supervisor: 'SUP123' },
        })

        await requestHandler(requestWithForm, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
