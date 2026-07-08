import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ProjectDetailsController from './appointmentDetailsController'
import AppointmentFormService, { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

jest.mock('../../pages/appointments/checkAppointmentDetailsPage')
jest.mock('../../utils/errorUtils')

describe('AppointmentsController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const checkAppointmentDetailsPageMock: jest.Mock =
    CheckAppointmentDetailsPage as unknown as jest.Mock<CheckAppointmentDetailsPage>
  const pageViewData = {
    someKey: 'some value',
  }

  const paths = {
    path1: 'path',
    path2: 'path 2',
  }

  const heading = {
    title: 'title',
  }

  let appointmentsController: ProjectDetailsController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const referenceDataService = createMock<ReferenceDataService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new ProjectDetailsController(
      appointmentService,
      formService,
      projectService,
      referenceDataService,
    )
  })

  describe('showSingle', () => {
    it('should render the check appointment details page', async () => {
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => {
        return {
          offenderHeading: () => heading,
          paths: () => paths,
          viewData: () => pageViewData,
        }
      })
      const appointment = appointmentFactory.build()
      const project = projectFactory.build()

      const testRequest = createMock<Request>({ params: { appointmentId }, query: {} })
      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)
      formService.createForm.mockResolvedValue({
        key: { id: 'test-id', type: 'some type' },
        data: appointmentOutcomeFormFactory.build(),
      })

      const requestHandler = appointmentsController.showSingle()
      await requestHandler(testRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/appointmentDetails',
        expect.objectContaining({
          ...pageViewData,
        }),
      )
    })

    it('should create a form with the appointment if a form does not exist', async () => {
      const newFormId = 'some-id'
      const newForm = { key: { id: newFormId, type: 'some type' }, data: appointmentOutcomeFormFactory.build() }
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        offenderHeading: (): Record<string, unknown> => ({}),
        paths: () => paths,
        viewData: () => pageViewData,
      }))

      formService.createForm.mockResolvedValue(newForm)

      const requestHandler = appointmentsController.showSingle()
      const response = createMock<Response>({ locals: { user: { username: userName } } })
      const appointment = appointmentFactory.build()
      const project = projectFactory.build()
      const testRequest = createMock<Request>({ params: { appointmentId }, query: {} })

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)

      await requestHandler(testRequest, response, next)

      expect(response.render).toHaveBeenCalled()
      expect(formService.createForm).toHaveBeenCalled()
    })

    it('should fetch the in progress form if it exists', async () => {
      const formId = '123'
      const viewData = {
        someProp: '',
      }
      const path = 'path'
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        offenderHeading: () => heading,
        paths: () => ({ path }),
        viewData: () => viewData,
      }))

      const formRequest = createMock<Request>({ params: { appointmentId }, query: { form: formId } })
      formService.getForm.mockResolvedValue(appointmentOutcomeFormFactory.build())

      const requestHandler = appointmentsController.showSingle()
      const response = createMock<Response>({ locals: { user: { username: userName } } })
      const appointment = appointmentFactory.build()
      const project = projectFactory.build()

      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)

      await requestHandler(formRequest, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(response.render).toHaveBeenCalledWith('appointments/update/appointmentDetails', {
        ...viewData,
        path,
        heading,
        form: formId,
      })
    })

    it('should call reference data service if appointment has a contact outcome code', async () => {
      const appointment = appointmentFactory.build({ contactOutcomeCode: 'OUTCOME_001' })
      const contactOutcome = contactOutcomeFactory.build({ code: 'OUTCOME_001' })

      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        offenderHeading: (): Record<string, unknown> => ({}),
        paths: (): Record<string, unknown> => ({}),
        selectedPeopleCard: (): undefined => undefined,
        viewData: (): Record<string, unknown> => ({}),
      }))

      appointmentService.getAppointment.mockResolvedValue(appointment)

      referenceDataService.getContactOutcome.mockResolvedValue(contactOutcome)

      const requestHandler = appointmentsController.showSingle()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(referenceDataService.getContactOutcome).toHaveBeenCalledWith(userName, 'OUTCOME_001')
    })

    it('should not call reference data service if appointment does not have a contact outcome code', async () => {
      const appointment = appointmentFactory.build({ contactOutcomeCode: undefined })

      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        offenderHeading: (): Record<string, unknown> => ({}),
        paths: (): Record<string, unknown> => ({}),
        selectedPeopleCard: (): undefined => undefined,
        viewData: (): Record<string, unknown> => ({}),
      }))

      appointmentService.getAppointment.mockResolvedValue(appointment)
      formService.createForm.mockResolvedValue({
        key: { id: 'form-id', type: 'some-type' },
        data: appointmentOutcomeFormFactory.build(),
      })

      const requestHandler = appointmentsController.showSingle()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(referenceDataService.getContactOutcome).not.toHaveBeenCalled()
    })
  })

  describe('showSession', () => {
    it('should call next', async () => {
      const response = createMock<Response>()
      const nextFunction = jest.fn()

      const requestHandler = appointmentsController.showSession()
      await requestHandler(request, response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
    })
  })

  describe('submit', () => {
    it('should redirect if no errors', async () => {
      const nextPath = '/nextPath'
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => nextPath,
        updateForm: (args: AppointmentOutcomeForm) => args,
        setFormId: () => {},
      }))

      const appointment = appointmentFactory.build()
      const project = projectFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })
  })
})
