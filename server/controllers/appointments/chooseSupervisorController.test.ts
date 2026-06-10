import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import { generateErrorSummary } from '../../utils/errorUtils'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import ChooseSupervisorController from './chooseSupervisorController'
import ProjectService from '../../services/projectService'

jest.mock('../../pages/appointments/chooseSupervisorPage.ts')
jest.mock('../../utils/errorUtils')

describe('ChooseSupervisorController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const projectCode = '2'
  const team = 'X123'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId, projectCode }, query: { team } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const chooseSupervisorPageMock: jest.Mock = ChooseSupervisorPage as unknown as jest.Mock<ChooseSupervisorPage>
  const generateErrorSummaryMock: jest.Mock = generateErrorSummary as jest.Mock
  const pageViewData = {
    someKey: 'some value',
  }

  let appointmentsController: ChooseSupervisorController
  const appointmentService = createMock<AppointmentService>()
  const providerDataService = createMock<ProviderService>()
  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new ChooseSupervisorController(
      appointmentService,
      formService,
      providerDataService,
      projectService,
    )
  })

  describe('show', () => {
    it('should render the choose supervisor page', async () => {
      chooseSupervisorPageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
          updatePath: () => '/path',
        }
      })
      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining({
          ...pageViewData,
        }),
      )
    })

    it('should fetch the in progress form if it exists', async () => {
      const formId = '123'
      const supervisorPath = '/path'
      const viewData = {
        someProp: '',
        team,
        form: formId,
        chooseSupervisorPath: supervisorPath,
      }

      chooseSupervisorPageMock.mockImplementationOnce(() => ({
        formId,
        viewData: () => viewData,
        updatePath: () => supervisorPath,
      }))

      formService.getForm.mockResolvedValue(appointmentOutcomeFormFactory.build())

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseSupervisor', viewData)
    })
  })

  describe('submit', () => {
    it('should return view if errors', async () => {
      const errors = { someKey: { text: 'some error' } }
      chooseSupervisorPageMock.mockImplementationOnce(() => ({
        viewData: () => pageViewData,
        validate: () => {},
        hasErrors: true,
        validationErrors: errors,
        updatePath: () => '/path',
      }))

      const errorSummary = {
        text: 'errors',
        href: '#link',
      }
      generateErrorSummaryMock.mockImplementation(() => errorSummary)

      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const providers = [providerSummaryFactory.build()]

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)
      providerDataService.getProviders.mockResolvedValue(providers)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseSupervisor',
        expect.objectContaining({
          errors,
          errorSummary,
          ...pageViewData,
        }),
      )
    })

    it('should redirect if no errors', async () => {
      const nextPath = '/nextPath'
      chooseSupervisorPageMock.mockImplementationOnce(() => ({
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => nextPath,
        updateForm: (args: AppointmentOutcomeForm) => args,
      }))

      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const providers = [providerSummaryFactory.build()]

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)
      providerDataService.getProviders.mockResolvedValue(providers)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })

    it('should handle form progress', async () => {
      const formId = '123'
      const existingForm = appointmentOutcomeFormFactory.build()
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      chooseSupervisorPageMock.mockImplementationOnce(() => ({
        formId,
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => '/nextPath',
        updateForm: () => formToSave,
      }))

      formService.getForm.mockResolvedValue(existingForm)

      const requestHandler = appointmentsController.submit()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
    })
  })
})
