import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import generateErrorSummary from '../../utils/errorUtils'
import ProjectDetailsController from './projectDetailsController'
import AppointmentFormService from '../../services/appointmentFormService'
import { AppointmentOutcomeForm } from '../../@types/user-defined'

jest.mock('../../pages/appointments/checkProjectDetailsPage')
jest.mock('../../utils/errorUtils')

describe('AppointmentsController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const checkProjectDetailsPageMock: jest.Mock =
    CheckProjectDetailsPage as unknown as jest.Mock<CheckProjectDetailsPage>
  const generateErrorSummaryMock: jest.Mock = generateErrorSummary as jest.Mock
  const pageViewData = {
    someKey: 'some value',
  }

  let appointmentsController: ProjectDetailsController
  const appointmentService = createMock<AppointmentService>()
  const providerDataService = createMock<ProviderService>()
  const formService = createMock<AppointmentFormService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new ProjectDetailsController(appointmentService, formService, providerDataService)
  })

  describe('show', () => {
    it('should render the check project details page', async () => {
      checkProjectDetailsPageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
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
        'appointments/update/projectDetails',
        expect.objectContaining({
          ...pageViewData,
        }),
      )
    })
  })

  describe('submit', () => {
    it('should return view if errors', async () => {
      const errors = { someKey: { text: 'some error' } }
      checkProjectDetailsPageMock.mockImplementationOnce(() => ({
        viewData: () => pageViewData,
        validate: () => {},
        hasErrors: true,
        validationErrors: errors,
      }))

      const errorSummary = {
        text: 'errors',
        href: '#link',
      }
      generateErrorSummaryMock.mockImplementation(() => errorSummary)

      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          errors,
          errorSummary,
          ...pageViewData,
        }),
      )
    })

    it('should redirect if no errors', async () => {
      const nextPath = '/nextPath'
      checkProjectDetailsPageMock.mockImplementationOnce(() => ({
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => nextPath,
        form: (args: AppointmentOutcomeForm) => args,
        setFormId: () => {},
      }))

      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })

    it('should create and save a form if a form does not exist', async () => {
      const newFormId = 'some-id'
      const newForm = { key: { id: newFormId, type: 'Some_type' }, data: {} }
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      checkProjectDetailsPageMock.mockImplementationOnce(() => ({
        formId: undefined,
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => '/nextPath',
        form: () => formToSave,
        setFormId: () => {},
      }))

      formService.createForm.mockReturnValue(newForm)

      const requestHandler = appointmentsController.submit()
      const response = createMock<Response>({ locals: { user: { name: userName } } })

      await requestHandler(request, response, next)

      expect(formService.createForm).toHaveBeenCalled()
    })

    it('should handle form progress if a form exists', async () => {
      const formId = '123'
      const existingForm = { startTime: '09:00' }
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      checkProjectDetailsPageMock.mockImplementationOnce(() => ({
        formId,
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => '/nextPath',
        form: () => formToSave,
        setFormId: () => {},
      }))

      formService.getForm.mockResolvedValue(existingForm)

      const requestHandler = appointmentsController.submit()
      const response = createMock<Response>({ locals: { user: { name: userName } } })

      await requestHandler(request, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
    })
  })
})
